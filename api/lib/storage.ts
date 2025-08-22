import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

// Vercel环境检测
const isVercel = process.env.VERCEL === '1';

// 在Vercel环境下使用/tmp目录
const uploadsDir = isVercel 
  ? '/tmp/uploads'
  : path.join(__dirname, '../../../legal.consulargo.io/backend/uploads');

const qrcodesDir = path.join(uploadsDir, 'qrcodes');

// 确保上传目录存在
export function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(qrcodesDir)) {
    fs.mkdirSync(qrcodesDir, { recursive: true });
  }
}

// 生成二维码文件
export async function generateQRCode(qrText: string, filename: string): Promise<string> {
  ensureUploadsDir();
  
  const filePath = path.join(qrcodesDir, `${filename}.png`);
  
  try {
    await QRCode.toFile(filePath, qrText, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return filePath;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

// 获取二维码文件路径
export function getQRCodePath(filename: string): string {
  return path.join(qrcodesDir, `${filename}.png`);
}

// 检查文件是否存在
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// 读取文件内容（用于下载）
export function readFile(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

// 删除文件
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Vercel存储限制说明
export const VERCEL_STORAGE_NOTE = `
注意：在Vercel无服务器环境下，文件存储在/tmp目录中，
这意味着文件在函数冷启动时会丢失。

生产环境建议使用以下文件存储方案：
1. Vercel Blob Storage（推荐）
2. AWS S3
3. Cloudinary
4. Uploadcare
5. Firebase Storage

要使用外部存储，需要修改此文件的存储逻辑。
`;

// 基于Vercel Blob的存储实现示例（需要安装@vercel/blob）
/*
import { put, del } from '@vercel/blob';

export async function uploadToVercelBlob(buffer: Buffer, filename: string): Promise<string> {
  const blob = await put(filename, buffer, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteFromVercelBlob(url: string): Promise<void> {
  await del(url);
}
*/
