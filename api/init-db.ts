import type { VercelRequest, VercelResponse } from '@vercel/node';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'legalization.db');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = new sqlite3.Database(dbPath);

    // 创建用户表
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          role VARCHAR(20) DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // 创建记录表
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          qr_code VARCHAR(20) UNIQUE NOT NULL,
          legalization_no VARCHAR(50) NOT NULL,
          issue_date DATE NOT NULL,
          place_of_issue VARCHAR(100),
          legalization_type VARCHAR(200) NOT NULL,
          authorized_officer VARCHAR(200) NOT NULL,
          document_owner VARCHAR(200) NOT NULL,
          document_type VARCHAR(200) NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // 检查是否需要创建默认管理员用户
    const adminCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (adminCount === 0) {
      // 创建默认管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO users (username, password, email, role)
          VALUES (?, ?, ?, ?)
        `, ['admin', hashedPassword, 'admin@example.com', 'admin'], (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    }

    db.close();

    res.status(200).json({ 
      message: 'Database initialized successfully',
      adminCreated: adminCount === 0
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
