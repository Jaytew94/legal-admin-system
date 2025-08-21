import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 检查数据库文件是否存在
    const dbPath = path.join(process.cwd(), 'database', 'legalization.db');
    
    if (!fs.existsSync(dbPath)) {
      console.error('Database file not found:', dbPath);
      return res.status(500).json({ error: 'Database not initialized' });
    }

    console.log('Database path:', dbPath);
    console.log('Database exists:', fs.existsSync(dbPath));

    // 连接数据库
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        return res.status(500).json({ error: 'Database connection failed' });
      }
    });

    // 查询用户
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) {
            console.error('Database query error:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    db.close();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, (user as any).password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: (user as any).id, username: (user as any).username },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user as any;

    res.status(200).json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
