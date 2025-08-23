// 独立的API服务器 - 可以部署到任何支持Node.js的平台
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

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
let records = [
  {
    id: 1,
    qr_code: 'kktftufnoxm',
    legalization_no: '1',
    issue_date: '2025-08-23',
    place_of_issue: 'SKA',
    legalization_type: 'SEEN AT THE MINISTRY OF FOREIGN AFFAIRS',
    authorized_officer: '1',
    document_owner: '1',
    document_type: '1',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
let recordId = 2;

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

// 下载二维码图片
app.get('/api/qrcode/download/:qrCode', (req, res) => {
  const { qrCode } = req.params;
  const record = records.find(r => r.qr_code === qrCode && r.status === 'active');
  
  if (!record) {
    return res.status(404).json({ error: '记录未找到或已失效' });
  }
  
  const qrImagePath = path.join(__dirname, 'legal.consulargo.io/backend/uploads/qrcodes', `${qrCode}.png`);
  
  // 检查文件是否存在
  if (!require('fs').existsSync(qrImagePath)) {
    return res.status(404).json({ error: '二维码图片文件不存在' });
  }
  
  // 设置下载头
  res.setHeader('Content-Disposition', `attachment; filename="${qrCode}.png"`);
  res.setHeader('Content-Type', 'image/png');
  
  // 发送文件
  res.sendFile(qrImagePath);
});

// 更新记录
app.put('/api/records/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权访问' });
  }

  const { id } = req.params;
  const updates = req.body;
  
  try {
    // 验证有效字段
    const validFields = ['legalization_no', 'applicant_name', 'document_type', 'issue_date', 'status'];
    const updateFields = Object.keys(updates).filter(key => validFields.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有有效的更新字段' });
    }
    
    // 查找记录
    const recordIndex = records.findIndex(r => r.id === parseInt(id));
    if (recordIndex === -1) {
      return res.status(404).json({ error: '记录未找到' });
    }
    
    // 更新记录
    updateFields.forEach(field => {
      records[recordIndex][field] = updates[field];
    });
    records[recordIndex].updated_at = new Date().toISOString();
    
    res.json({ 
      message: '记录更新成功',
      record: records[recordIndex]
    });
  } catch (error) {
    console.error('更新记录失败:', error);
    res.status(500).json({ error: '更新记录失败' });
  }
});

// 删除记录
app.delete('/api/records/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权访问' });
  }

  const { id } = req.params;
  
  try {
    // 查找记录
    const recordIndex = records.findIndex(r => r.id === parseInt(id));
    if (recordIndex === -1) {
      return res.status(404).json({ error: '记录未找到' });
    }
    
    // 删除记录
    const deletedRecord = records.splice(recordIndex, 1)[0];
    
    res.json({ 
      message: '记录删除成功',
      deletedRecord: deletedRecord
    });
  } catch (error) {
    console.error('删除记录失败:', error);
    res.status(500).json({ error: '删除记录失败' });
  }
});

// 提供静态验证页面（check目录）
const checkPath = path.join(__dirname, 'check');
console.log('🔍 check目录路径:', checkPath);
console.log('🔍 sticker.html存在:', require('fs').existsSync(path.join(checkPath, 'sticker.html')));

// 处理无扩展名的静态页面路由
app.get('/check/sticker', (req, res) => {
  const query = req.url.includes('?') ? req.url.split('?')[1] : '';
  const redirectUrl = query ? `/check/sticker.html?${query}` : '/check/sticker.html';
  res.redirect(redirectUrl);
});

app.get('/check/transparent', (req, res) => {
  const query = req.url.includes('?') ? req.url.split('?')[1] : '';
  const redirectUrl = query ? `/check/transparent.html?${query}` : '/check/transparent.html';
  res.redirect(redirectUrl);
});

app.use('/check', express.static(checkPath));

// 提供二维码图片文件
const qrcodesPath = path.join(__dirname, 'legal.consulargo.io/backend/uploads/qrcodes');
console.log('🔍 二维码目录路径:', qrcodesPath);
console.log('🔍 二维码目录存在:', require('fs').existsSync(qrcodesPath));
app.use('/uploads/qrcodes', express.static(qrcodesPath));

// 提供前端静态文件（必须在API路由之后）
const staticPath = path.join(__dirname, 'legal.consulargo.io/frontend/build');
console.log('🔍 静态文件路径:', staticPath);
console.log('🔍 index.html存在:', require('fs').existsSync(path.join(staticPath, 'index.html')));
app.use(express.static(staticPath));

// 处理React Router - 将所有非API/check请求重定向到index.html
app.get('*', (req, res) => {
  // 如果是API请求，返回404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API端点未找到' });
  }

  // 如果是check路径，已经被上面的静态文件中间件处理了
  if (req.path.startsWith('/check/')) {
    return res.status(404).json({ error: '静态页面未找到' });
  }

  // 否则返回React应用
  res.sendFile(path.join(__dirname, 'legal.consulargo.io/frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 API服务器启动成功！`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`💡 健康检查: http://localhost:${PORT}/api/health`);
});
