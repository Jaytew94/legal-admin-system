import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// 内存中的记录数据（与验证页面共享）
let records: any[] = [
  {
    id: 1,
    qr_code: 'zVtgAi18NOlvLivHYMjj',
    legalization_no: 'SKAKP5V-001',
    issue_date: '2025-04-14',
    place_of_issue: 'SKA',
    legalization_type: 'SEEN AT THE MINISTRY OF FOREIGN AFFAIRS',
    authorized_officer: 'MISS SAMARIN SIRISAWAT',
    document_owner: 'MISS UNYANEE KHAOWISET',
    document_type: 'CERTIFICATE OF BIRTH',
    status: 'active',
    created_by: 1,
    created_by_name: 'admin',
    created_at: '2025-08-22T06:00:00.000Z',
    updated_at: '2025-08-22T06:00:00.000Z'
  }
];
let nextId = 2;

// 生成随机QR码
function generateQRCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 验证JWT token
function verifyToken(req: VercelRequest): any {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 验证token
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // 获取记录列表
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    let filteredRecords = records;
    
    if (search) {
      filteredRecords = records.filter(record => 
        record.legalization_no.includes(search) ||
        record.document_owner.includes(search) ||
        record.authorized_officer.includes(search)
      );
    }
    
    if (status) {
      filteredRecords = filteredRecords.filter(record => record.status === status);
    }
    
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
    
    res.status(200).json({
      records: paginatedRecords,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredRecords.length,
        pages: Math.ceil(filteredRecords.length / Number(limit))
      }
    });
  } else if (req.method === 'POST') {
    // 创建新记录
    const { 
      legalization_no, 
      issue_date, 
      place_of_issue, 
      legalization_type, 
      authorized_officer, 
      document_owner, 
      document_type 
    } = req.body;

    if (!legalization_no || !issue_date || !legalization_type || !authorized_officer || !document_owner || !document_type) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const newRecord = {
      id: nextId++,
      qr_code: generateQRCode(),
      legalization_no,
      issue_date,
      place_of_issue: place_of_issue || '',
      legalization_type,
      authorized_officer,
      document_owner,
      document_type,
      status: 'active',
      created_by: user.userId,
      created_by_name: user.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    records.push(newRecord);

    res.status(201).json({
      message: 'Record created successfully',
      record: {
        id: newRecord.id,
        qr_code: newRecord.qr_code,
        qr_filename: `qr_${newRecord.qr_code}.png`
      }
    });
  } else if (req.method === 'DELETE') {
    // 删除记录
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    const initialCount = records.length;
    records = records.filter(record => !ids.includes(record.id));
    const deletedCount = initialCount - records.length;

    res.status(200).json({
      message: 'Records deleted successfully',
      deletedCount
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// 导出records数组供其他API使用
export { records };
