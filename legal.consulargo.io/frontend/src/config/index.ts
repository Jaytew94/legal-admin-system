// 环境配置管理
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// 默认配置
const defaultConfig = {
  apiUrl: isDevelopment ? 'http://localhost:3000/api' : 'https://your-backend-api.com/api',
  baseUrl: isDevelopment ? 'http://localhost:3001' : window.location.origin,
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
};

// GitHub Pages 配置检测
const isGitHubPages = window.location.hostname.includes('github.io');
if (isGitHubPages) {
  defaultConfig.baseUrl = window.location.origin + '/legal-admin-system';
  defaultConfig.apiUrl = 'https://your-backend-api.com/api'; // 需要替换为实际后端地址
}

export const config = {
  ...defaultConfig,
  // 允许环境变量覆盖
  apiUrl: process.env.REACT_APP_API_URL || defaultConfig.apiUrl,
  baseUrl: process.env.REACT_APP_BASE_URL || defaultConfig.baseUrl,
};

export default config;
