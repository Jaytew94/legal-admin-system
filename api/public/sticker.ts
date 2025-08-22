import type { VercelRequest, VercelResponse } from '@vercel/node';

// 内存中的记录数据（仅用于测试）
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
    created_at: '2025-08-22T06:00:00.000Z',
    updated_at: '2025-08-22T06:00:00.000Z'
  }
];

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
        issue_date: record.issue_date,
        place_of_issue: record.place_of_issue,
        legalization_type: record.legalization_type,
        authorized_officer: record.authorized_officer,
        document_owner: record.document_owner,
        document_type: record.document_type,
        status: record.status,
        created_at: record.created_at
      }
    });

  } catch (error) {
    console.error('Error in sticker API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
