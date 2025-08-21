import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../models/database';
import { generateQRCode, generateRandomQRCode } from '../utils/qrcode';

interface AuthRequest extends express.Request {
  user?: any;
}

const router = express.Router();

// 获取所有记录
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const { page = 1, limit = 10, search = '', status = '' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];

  if (search) {
    whereClause += ' AND (qr_code LIKE ? OR legalization_no LIKE ? OR document_owner LIKE ? OR authorized_officer LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  // 获取总数
  db.get(
    `SELECT COUNT(*) as total FROM records ${whereClause}`,
    params,
    (err, countResult: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // 获取记录
      db.all(
        `SELECT r.*, u.username as created_by_name 
         FROM records r 
         LEFT JOIN users u ON r.created_by = u.id 
         ${whereClause} 
         ORDER BY r.created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, Number(limit), offset],
        (err, records) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            records,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: countResult.total,
              pages: Math.ceil(countResult.total / Number(limit))
            }
          });
        }
      );
    }
  );
});

// 获取单个记录
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  db.get(
    `SELECT r.*, u.username as created_by_name 
     FROM records r 
     LEFT JOIN users u ON r.created_by = u.id 
     WHERE r.id = ?`,
    [id],
    (err, record) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json({ record });
    }
  );
});

// 创建新记录
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      legalization_no,
      issue_date,
      place_of_issue,
      legalization_type,
      authorized_officer,
      document_owner,
      document_type
    } = req.body;

    // 验证必填字段
    if (!legalization_no || !issue_date || !legalization_type || !authorized_officer || !document_owner || !document_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 生成唯一的QR码
    let qrCode = generateRandomQRCode();
    let isUnique = false;
    let attempts = 0;

    // 使用Promise包装数据库查询
    const checkQRCodeUnique = (code: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        db.get('SELECT id FROM records WHERE qr_code = ?', [code], (err, existing) => {
          if (err) {
            reject(err);
          } else {
            resolve(!existing);
          }
        });
      });
    };

    // 生成唯一QR码
    while (!isUnique && attempts < 10) {
      try {
        isUnique = await checkQRCodeUnique(qrCode);
        if (!isUnique) {
          qrCode = generateRandomQRCode();
          attempts++;
        }
      } catch (error) {
        return res.status(500).json({ error: 'Database error' });
      }
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique QR code' });
    }

    // 生成二维码图片
    const qrFilename = await generateQRCode(qrCode);

    // 插入记录
    db.run(
      `INSERT INTO records (
        qr_code, legalization_no, issue_date, place_of_issue, 
        legalization_type, authorized_officer, document_owner, 
        document_type, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        qrCode, legalization_no, issue_date, place_of_issue,
        legalization_type, authorized_officer, document_owner,
        document_type, req.user.id
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create record' });
        }

        res.status(201).json({
          message: 'Record created successfully',
          record: {
            id: this.lastID,
            qr_code: qrCode,
            qr_filename: qrFilename
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 更新记录
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const {
    legalization_no,
    issue_date,
    place_of_issue,
    legalization_type,
    authorized_officer,
    document_owner,
    document_type,
    status
  } = req.body;

  db.run(
    `UPDATE records SET 
      legalization_no = ?, issue_date = ?, place_of_issue = ?,
      legalization_type = ?, authorized_officer = ?, document_owner = ?,
      document_type = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      legalization_no, issue_date, place_of_issue,
      legalization_type, authorized_officer, document_owner,
      document_type, status, id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update record' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json({ message: 'Record updated successfully' });
    }
  );
});

// 删除记录
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;

  db.run('DELETE FROM records WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete record' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  });
});

// 批量删除记录
router.delete('/', authenticateToken, (req: AuthRequest, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'IDs array is required' });
  }

  const placeholders = ids.map(() => '?').join(',');
  
  db.run(`DELETE FROM records WHERE id IN (${placeholders})`, ids, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete records' });
    }

    res.json({ 
      message: `${this.changes} records deleted successfully`,
      deletedCount: this.changes
    });
  });
});

// 批量更新状态
router.patch('/status', authenticateToken, (req: AuthRequest, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
    return res.status(400).json({ error: 'IDs array and status are required' });
  }

  const placeholders = ids.map(() => '?').join(',');
  
  db.run(
    `UPDATE records SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
    [status, ...ids],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update records' });
      }

      res.json({ 
        message: `${this.changes} records updated successfully`,
        updatedCount: this.changes
      });
    }
  );
});

export default router;
