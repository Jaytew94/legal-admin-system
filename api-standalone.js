// 独立的API服务器 - 可以部署到任何支持Node.js的平台
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  }
];

// 模拟记录数据
let records = [];
let recordId = 1;

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: '领事认证管理系统API正常运行'
  });
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  // 生成简单的token（实际生产环境应使用JWT）
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  
  res.json({
    message: '登录成功',
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// 获取记录列表
app.get('/api/records', (req, res) => {
  res.json({
    records: records,
    pagination: {
      page: 1,
      limit: 10,
      total: records.length,
      pages: Math.ceil(records.length / 10)
    }
  });
});

// 创建记录
app.post('/api/records', (req, res) => {
  const record = {
    id: recordId++,
    qr_code: Math.random().toString(36).substr(2, 20),
    ...req.body,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  records.push(record);
  
  res.json({
    message: '记录创建成功',
    record: {
      id: record.id,
      qr_code: record.qr_code,
      qr_filename: `${record.qr_code}.png`
    }
  });
});

// 根据二维码获取信息
app.get('/api/qrcode/info/:qrCode', (req, res) => {
  const record = records.find(r => r.qr_code === req.params.qrCode);
  
  if (!record || record.status !== 'active') {
    return res.status(404).json({ error: '记录未找到或已失效' });
  }
  
  res.json({
    success: true,
    record: record
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API服务器启动成功！`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`💡 健康检查: http://localhost:${PORT}/api/health`);
});
