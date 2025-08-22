import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { records } from './index';

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

  const { id } = req.query;
  const recordId = Number(id);

  if (req.method === 'GET') {
    // 获取单个记录
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json({ record });
  } else if (req.method === 'PUT') {
    // 更新记录
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

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

    records[recordIndex] = {
      ...records[recordIndex],
      legalization_no: legalization_no || records[recordIndex].legalization_no,
      issue_date: issue_date || records[recordIndex].issue_date,
      place_of_issue: place_of_issue || records[recordIndex].place_of_issue,
      legalization_type: legalization_type || records[recordIndex].legalization_type,
      authorized_officer: authorized_officer || records[recordIndex].authorized_officer,
      document_owner: document_owner || records[recordIndex].document_owner,
      document_type: document_type || records[recordIndex].document_type,
      status: status || records[recordIndex].status,
      updated_at: new Date().toISOString()
    };

    res.status(200).json({
      message: 'Record updated successfully',
      record: records[recordIndex]
    });
  } else if (req.method === 'DELETE') {
    // 删除单个记录
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    records.splice(recordIndex, 1);

    res.status(200).json({
      message: 'Record deleted successfully'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
