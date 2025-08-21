import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const authService = {
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '密码修改失败');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('获取用户信息失败');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};
