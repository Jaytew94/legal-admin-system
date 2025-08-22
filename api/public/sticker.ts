import type { VercelRequest, VercelResponse } from '@vercel/node';

// 导入共享的记录数据
import { records } from '../records/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { qr } = req.query;

    if (!qr) {
      return res.status(400).json({ error: 'QR code parameter is required' });
    }

    console.log('Looking for QR code:', qr);
    console.log('Available records:', records.map(r => r.qr_code));

    // 查找记录
    const record = records.find(r => r.qr_code === qr);

    if (!record) {
      console.log('Record not found for QR:', qr);
      return res.status(404).json({ error: 'Record not found' });
    }

    console.log('Record found:', record);

    res.status(200).json({
      record: {
        id: record.id,
        qr_code: record.qr_code,
        legalization_no: record.legalization_no,
        date_of_issue: record.issue_date,
        place_of_issue: record.place_of_issue,
        type_of_legalization: record.legalization_type,
        authorized_officer: record.authorized_officer,
        document_owner: record.document_owner,
        type_of_document: record.document_type,
        status: record.status,
        created_at: record.created_at
      }
    });

  } catch (error) {
    console.error('Error in sticker API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
