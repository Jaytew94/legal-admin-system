import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../models/database';
import { generateQRCode, getQRCodePath } from '../utils/qrcode';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends express.Request {
  user?: any;
}

const router = express.Router();

// 下载单个二维码 - 移除认证要求，允许公开下载
router.get('/download/:qrCode', (req: AuthRequest, res) => {
  const { qrCode } = req.params;
  const filename = `${qrCode}.png`;
  const filepath = getQRCodePath(filename);

  // 检查文件是否存在
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'QR code file not found' });
  }

  // 设置下载头
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'image/png');
  
  // 发送文件
  res.sendFile(filepath);
});

// 批量下载二维码
router.post('/download-batch', authenticateToken, (req: AuthRequest, res) => {
  const { qrCodes } = req.body;

  if (!qrCodes || !Array.isArray(qrCodes) || qrCodes.length === 0) {
    return res.status(400).json({ error: 'QR codes array is required' });
  }

  // 检查所有文件是否存在
  const missingFiles = qrCodes.filter(qrCode => {
    const filename = `${qrCode}.png`;
    const filepath = getQRCodePath(filename);
    return !fs.existsSync(filepath);
  });

  if (missingFiles.length > 0) {
    return res.status(404).json({ 
      error: 'Some QR code files not found',
      missingFiles 
    });
  }

  // 创建临时压缩文件 (这里简化处理，实际可以使用 archiver 库)
  res.json({ 
    message: 'Files ready for download',
    files: qrCodes.map(qrCode => ({
      qrCode,
      filename: `${qrCode}.png`,
      downloadUrl: `/api/qrcode/download/${qrCode}`
    }))
  });
});

// 重新生成二维码
router.post('/regenerate/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    // 获取记录信息
    db.get('SELECT qr_code FROM records WHERE id = ?', [id], async (err, record: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // 重新生成二维码
      const qrFilename = await generateQRCode(record.qr_code);

      res.json({
        message: 'QR code regenerated successfully',
        filename: qrFilename
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate QR code' });
  }
});

// 获取二维码信息
router.get('/info/:qrCode', (req, res) => {
  const { qrCode } = req.params;

  db.get(
    `SELECT r.*, u.username as created_by_name 
     FROM records r 
     LEFT JOIN users u ON r.created_by = u.id 
     WHERE r.qr_code = ? AND r.status = 'active'`,
    [qrCode],
    (err, record) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!record) {
        return res.status(404).json({ error: 'Record not found or inactive' });
      }

      res.json({ record });
    }
  );
});

// 预览二维码 - 直接显示二维码图片
router.get('/preview/:qrCode', (req, res) => {
  const { qrCode } = req.params;
  const filename = `${qrCode}.png`;
  const filepath = getQRCodePath(filename);

  // 检查文件是否存在
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'QR code file not found' });
  }

  // 设置内容类型为图片
  res.setHeader('Content-Type', 'image/png');
  
  // 发送文件
  res.sendFile(filepath);
});

export default router;
