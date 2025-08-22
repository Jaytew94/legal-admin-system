import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// 导入路由
import authRoutes from '../legal.consulargo.io/backend/src/routes/auth';
import recordRoutes from '../legal.consulargo.io/backend/src/routes/records';
import userRoutes from '../legal.consulargo.io/backend/src/routes/users';
import qrcodeRoutes from '../legal.consulargo.io/backend/src/routes/qrcode';

// 导入数据库初始化
import { initDatabase } from './lib/database';

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      styleSrc: ["'self'", "https:", "http:", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https:", "http:", "data:"],
      connectSrc: ["'self'", "https:", "http:"],
      frameSrc: ["'self'", "https:", "http:"],
      objectSrc: ["'self'", "https:", "http:"],
      mediaSrc: ["'self'", "https:", "http:"],
      manifestSrc: ["'self'", "https:", "http:"]
    }
  }
}));

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://jayt.github.io',
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.github\.io$/
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qrcode', qrcodeRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    platform: 'Vercel'
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 初始化数据库（仅在第一次请求时）
let dbInitialized = false;
const initDatabaseOnce = async () => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('Database initialized for Vercel');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
};

// Vercel 无服务器函数处理器
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // 确保数据库已初始化
    await initDatabaseOnce();
    
    // 使用 Express 应用处理请求
    return app(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    return res.status(500).json({ error: 'Server initialization failed' });
  }
};
