import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Vercel环境下的数据库配置
const isVercel = process.env.VERCEL === '1';

// 在Vercel环境下使用/tmp目录作为临时存储
const dbPath = isVercel 
  ? '/tmp/legalization.db'
  : process.env.DATABASE_PATH || path.join(__dirname, '../../../database/legalization.db');

let dbInstance: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!dbInstance) {
    // 在Vercel环境下，确保目录存在
    if (isVercel) {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }
    
    dbInstance = new sqlite3.Database(dbPath);
  }
  return dbInstance;
}

export const db = getDatabase();

export async function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.serialize(() => {
      // 创建用户表
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          role VARCHAR(20) DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建记录表
      database.run(`
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
      `);

      // 检查是否需要创建默认管理员用户
      database.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row: any) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
          return;
        }

        if (row.count === 0) {
          // 创建默认管理员用户 (admin/admin123)
          const bcrypt = require('bcryptjs');
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          database.run(`
            INSERT INTO users (username, password, email, role)
            VALUES (?, ?, ?, ?)
          `, ['admin', hashedPassword, 'admin@example.com', 'admin'], (err) => {
            if (err) {
              console.error('Failed to create admin user:', err);
              reject(err);
            } else {
              console.log('Default admin user created: admin/admin123');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  });
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// 在Vercel环境下，由于无服务器函数的特性，数据库会在每次冷启动时重新初始化
// 这里提供一个数据持久化的解决方案说明
export const VERCEL_DATABASE_NOTE = `
注意：在Vercel无服务器环境下，SQLite数据库存储在/tmp目录中，
这意味着数据在函数冷启动时会丢失。

生产环境建议使用以下持久化数据库方案：
1. Vercel Postgres（推荐）
2. PlanetScale MySQL
3. MongoDB Atlas
4. Supabase PostgreSQL

要使用外部数据库，请设置DATABASE_URL环境变量并修改此文件的数据库连接逻辑。
`;
