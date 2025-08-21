import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

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

export interface Record {
  id: number;
  qr_code: string;
  legalization_no: string;
  issue_date: string;
  place_of_issue?: string;
  legalization_type: string;
  authorized_officer: string;
  document_owner: string;
  document_type: string;
  status: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecordData {
  legalization_no: string;
  issue_date: string;
  place_of_issue?: string;
  legalization_type: string;
  authorized_officer: string;
  document_owner: string;
  document_type: string;
}

export interface RecordsResponse {
  records: Record[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const recordService = {
  // 获取记录列表
  getRecords: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<RecordsResponse> => {
    const response = await api.get('/records', { params });
    return response.data;
  },

  // 获取单个记录
  getRecord: async (id: number): Promise<{ record: Record }> => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  // 创建记录
  createRecord: async (data: CreateRecordData): Promise<{
    message: string;
    record: { id: number; qr_code: string; qr_filename: string };
  }> => {
    const response = await api.post('/records', data);
    return response.data;
  },

  // 更新记录
  updateRecord: async (id: number, data: Partial<CreateRecordData> & { status?: string }): Promise<{ message: string }> => {
    const response = await api.put(`/records/${id}`, data);
    return response.data;
  },

  // 删除记录
  deleteRecord: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },

  // 批量删除记录
  deleteRecords: async (ids: number[]): Promise<{ message: string; deletedCount: number }> => {
    const response = await api.delete('/records', { data: { ids } });
    return response.data;
  },

  // 批量更新状态
  updateRecordsStatus: async (ids: number[], status: string): Promise<{ message: string; updatedCount: number }> => {
    const response = await api.patch('/records/status', { ids, status });
    return response.data;
  },
};
