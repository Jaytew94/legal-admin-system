import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { db } from '../models/database';

interface AuthRequest extends express.Request {
  user?: any;
}

const router = express.Router();

// 获取所有用户 (仅管理员)
router.get('/', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  db.all(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ users });
    }
  );
});

// 创建新用户 (仅管理员)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { username, password, email, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 检查用户名是否已存在
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      db.run(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          res.status(201).json({
            message: 'User created successfully',
            user: {
              id: this.lastID,
              username,
              email,
              role
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 更新用户 (仅管理员)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // 检查用户名是否已被其他用户使用
    db.get(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, id],
      async (err, existing) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existing) {
          return res.status(400).json({ error: 'Username already exists' });
        }

        let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?';
        let params = [username, email, role];

        // 如果提供了新密码，则更新密码
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          updateQuery += ', password = ?';
          params.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        params.push(id);

        db.run(updateQuery, params, function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update user' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
          }

          res.json({ message: 'User updated successfully' });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 删除用户 (仅管理员)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;

  // 防止删除自己
  if (Number(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// 获取用户统计信息 (仅管理员)
router.get('/stats', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  db.get(
    'SELECT COUNT(*) as total_users FROM users',
    (err, userStats: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      db.get(
        'SELECT COUNT(*) as total_records FROM records',
        (err, recordStats: any) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            stats: {
              totalUsers: userStats.total_users,
              totalRecords: recordStats.total_records
            }
          });
        }
      );
    }
  );
});

export default router;
