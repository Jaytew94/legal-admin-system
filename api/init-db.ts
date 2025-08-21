import type { VercelRequest, VercelResponse } from '@vercel/node';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dbPath = path.join(process.cwd(), 'database', 'legalization.db');
    const dbDir = path.dirname(dbPath);

    console.log('Database directory:', dbDir);
    console.log('Database path:', dbPath);

    // 确保数据库目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('Created database directory');
    }

    // 创建数据库连接
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database creation error:', err);
        return res.status(500).json({ error: 'Failed to create database' });
      }
      console.log('Database created/connected successfully');
    });

    // 创建用户表
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Create users table error:', err);
          reject(err);
        } else {
          console.log('Users table created/verified');
          resolve(true);
        }
      });
    });

    // 创建法律记录表
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS legalization_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          legalization_no TEXT NOT NULL,
          date_of_issue TEXT NOT NULL,
          place_of_issue TEXT NOT NULL,
          type_of_legalization TEXT NOT NULL,
          authorized_officer TEXT NOT NULL,
          document_owner TEXT NOT NULL,
          type_of_document TEXT NOT NULL,
          qr_code TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Create legalization_records table error:', err);
          reject(err);
        } else {
          console.log('Legalization records table created/verified');
          resolve(true);
        }
      });
    });

    // 检查是否已存在管理员用户
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('Check admin user error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!existingAdmin) {
      // 创建默认管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          ['admin', hashedPassword],
          function(err) {
            if (err) {
              console.error('Create admin user error:', err);
              reject(err);
            } else {
              console.log('Admin user created with ID:', this.lastID);
              resolve(true);
            }
          }
        );
      });
    } else {
      console.log('Admin user already exists');
    }

    db.close((err) => {
      if (err) {
        console.error('Database close error:', err);
      } else {
        console.log('Database closed successfully');
      }
    });

    res.status(200).json({ 
      message: 'Database initialized successfully',
      databasePath: dbPath,
      adminUser: 'admin',
      adminPassword: 'admin123'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed', 
      details: error.message 
    });
  }
}
