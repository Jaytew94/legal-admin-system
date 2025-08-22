// 环境配置管理
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// 检测部署环境
const isGitHubPages = window.location.hostname.includes('github.io');
const isVercelApp = window.location.hostname.includes('vercel.app');
const isLocalhost = window.location.hostname === 'localhost';

// API URL 配置
const getApiUrl = () => {
  // 开发环境
  if (isDevelopment || isLocalhost) {
    return 'http://localhost:3000/api';
  }
  
  // 如果设置了环境变量，优先使用
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Vercel 部署环境
  if (isVercelApp) {
    // 如果前端和后端都部署在同一个Vercel项目
    return window.location.origin + '/api';
  }
  
  // GitHub Pages 或其他环境
  // 这里需要替换为您的Vercel后端URL
  return 'https://legal-admin-system-api.vercel.app/api';
};

// 默认配置
const defaultConfig = {
  apiUrl: getApiUrl(),
  baseUrl: isDevelopment ? 'http://localhost:3001' : window.location.origin,
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
};

// GitHub Pages 特殊配置
if (isGitHubPages) {
  defaultConfig.baseUrl = window.location.origin + '/legal-admin-system';
}

export const config = {
  ...defaultConfig,
  // 允许环境变量覆盖
  apiUrl: process.env.REACT_APP_API_URL || defaultConfig.apiUrl,
  baseUrl: process.env.REACT_APP_BASE_URL || defaultConfig.baseUrl,
};

export default config;
