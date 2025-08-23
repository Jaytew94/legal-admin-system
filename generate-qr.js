const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 要生成的二维码列表
const qrCodes = ['kktftufnoxm'];

// 确保目录存在
const uploadsDir = path.join(__dirname, 'legal.consulargo.io/backend/uploads/qrcodes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function generateQRCode(qrCode) {
  try {
    const filePath = path.join(uploadsDir, `${qrCode}.png`);
    
    // 生成二维码
    await QRCode.toFile(filePath, qrCode, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200,
      margin: 2
    });
    
    console.log(`✅ 生成二维码: ${qrCode}.png`);
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
