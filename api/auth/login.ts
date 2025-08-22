import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// 内存中的用户数据（仅用于测试）
const adminUser = {
  id: 1,
  username: 'admin',
  password: 'admin123' // 直接使用明文密码（仅用于测试）
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Expected username:', adminUser.username);
    console.log('Expected password:', adminUser.password);

    // 检查用户是否存在
    if (username !== adminUser.username) {
      console.log('Username mismatch');
      return res.status(401).json({ error: 'Invalid credentials - username' });
    }

    // 验证密码（直接比较）
    if (password !== adminUser.password) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials - password' });
    }

    console.log('Password verified successfully');

    // 生成JWT token
    const token = jwt.sign(
      { userId: adminUser.id, username: adminUser.username },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    console.log('JWT token generated');

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = adminUser;

    res.status(200).json({
      token,
      user: userWithoutPassword,
      message: 'Login successful!'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
