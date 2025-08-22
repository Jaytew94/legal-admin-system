// 生产环境配置
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://your-backend-api.com/api',
  baseUrl: process.env.REACT_APP_BASE_URL || 'https://jayt.github.io/legal-admin-system',
  version: '1.0.0',
  environment: 'production'
};

export default config;
