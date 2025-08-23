import axios from 'axios';
import { config } from '../config';

const API_BASE_URL = config.apiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUserData {
  username: string;
  role?: string;
}

export interface UsersResponse {
  users: User[];
}

export const userService = {
  // 获取所有用户
  getUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/users');
    return response.data;
  },

  // 创建用户
  createUser: async (data: CreateUserData): Promise<{
    message: string;
    user: User;
  }> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // 更新用户
  updateUser: async (id: number, data: UpdateUserData): Promise<{
    message: string;
    user: User;
  }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // 删除用户
  deleteUser: async (id: number): Promise<{
    message: string;
    deletedUser: User;
  }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
