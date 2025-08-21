import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// 导入路由
import authRoutes from './routes/auth';
import recordRoutes from './routes/records';
import userRoutes from './routes/users';
import qrcodeRoutes from './routes/qrcode';

// 导入数据库初始化
import { initDatabase } from './models/database';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../config.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // 放宽 CSP 以允许内联脚本与外链样式/字体/图片
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      // 允许所有来源
      defaultSrc: ["'self'", "https:", "http:"],
      // 允许内联脚本（静态页面内嵌 js）与所有源
      scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      // 允许内联样式与所有源（外链 css）
      styleSrc: ["'self'", "https:", "http:", "'unsafe-inline'"],
      // 允许图片来自所有源
      imgSrc: ["'self'", "data:", "https:", "http:"],
      // 允许字体来自所有源
      fontSrc: ["'self'", "https:", "http:", "data:"],
      // 允许连接到所有源
      connectSrc: ["'self'", "https:", "http:"],
      // 允许iframe
      frameSrc: ["'self'", "https:", "http:"],
      // 允许object
      objectSrc: ["'self'", "https:", "http:"],
      // 允许media
      mediaSrc: ["'self'", "https:", "http:"],
      // 允许manifest
      manifestSrc: ["'self'", "https:", "http:"]
    }
  }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 静态页面服务
app.use('/check', express.static(path.join(__dirname, '../../check')));

// 处理 /check/sticker 路由，返回 sticker.html
app.get('/check/sticker', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../check/sticker.html'));
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qrcode', qrcodeRoutes);

// 健康检查
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
