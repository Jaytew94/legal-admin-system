import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../database/legalization.db');

export const db = new sqlite3.Database(dbPath);

export async function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 创建用户表
      db.run(`
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
      `);

      // 检查是否需要创建默认管理员用户
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          // 创建默认管理员用户 (admin/admin123)
          const bcrypt = require('bcryptjs');
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          db.run(`
            INSERT INTO users (username, password, email, role)
            VALUES (?, ?, ?, ?)
          `, ['admin', hashedPassword, 'admin@example.com', 'admin'], (err) => {
            if (err) {
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
  db.close();
}

