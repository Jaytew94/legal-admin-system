import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
const qrcodesDir = path.join(uploadsDir, 'qrcodes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(qrcodesDir)) {
  fs.mkdirSync(qrcodesDir, { recursive: true });
}

export async function generateQRCode(qrCode: string): Promise<string> {
  try {
    // 使用环境变量或默认localhost:3000
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/check/sticker?qr=${qrCode}`;
    const filename = `${qrCode}.png`;
    const filepath = path.join(qrcodesDir, filename);

    await QRCode.toFile(filepath, url, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    return filename;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function generateRandomQRCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getQRCodePath(filename: string): string {
  return path.join(qrcodesDir, filename);
}
