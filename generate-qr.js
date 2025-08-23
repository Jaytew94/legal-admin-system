const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 要生成的二维码列表
const qrCodes = ['A1B2C3D4E5F6G7H8I9J0']; // 只生成测试数据的二维码

// 确保目录存在
const uploadsDir = path.join(__dirname, 'legal.consulargo.io/backend/uploads/qrcodes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function generateQRCode(qrCode) {
  try {
    const filePath = path.join(uploadsDir, `${qrCode}.png`);
    
    // 生成包含完整URL的二维码内容
    const qrCodeContent = `https://legal-admin-system-production.up.railway.app/check/sticker?qr=${qrCode}`;
    
    await QRCode.toFile(filePath, qrCodeContent, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M'
    });
    
    console.log(`✅ 生成二维码: ${qrCode}.png (内容: ${qrCodeContent})`);
  } catch (error) {
    console.error(`❌ 生成二维码失败 ${qrCode}:`, error);
  }
}

async function generateAllQRCodes() {
  console.log('🚀 开始生成二维码...');
  
  for (const qrCode of qrCodes) {
    await generateQRCode(qrCode);
  }
  
  console.log('🎉 二维码生成完成！');
}

generateAllQRCodes();
