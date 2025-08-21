# 部署指南

## 🚀 本地开发

### 启动后端服务
```bash
cd backend
npm install
npm run build
npm start
```

### 启动前端服务
```bash
cd frontend
npm install
npm start
```

## 🌐 生产环境部署

### 1. 环境变量配置

创建 `backend/config.env` 文件：
```env
PORT=3000
JWT_SECRET=your-production-jwt-secret-key
NODE_ENV=production
DATABASE_PATH=./database/legalization.db
BASE_URL=https://your-domain.com
```

### 2. 构建前端
```bash
cd frontend
npm run build
```

### 3. 部署选项

#### 选项A：Vercel部署（推荐）
1. 将代码推送到GitHub
2. 在Vercel中导入GitHub仓库
3. 配置环境变量
4. 设置构建命令和输出目录

#### 选项B：Netlify部署
1. 将代码推送到GitHub
2. 在Netlify中连接GitHub仓库
3. 配置构建设置

#### 选项C：传统服务器部署
1. 上传代码到服务器
2. 安装Node.js和npm
3. 运行 `npm install` 和 `npm run build`
4. 使用PM2或systemd管理进程

### 4. 数据库初始化
```bash
cd backend
node dist/app.js
# 系统会自动创建数据库和默认管理员账户
```

### 5. 默认管理员账户
- 用户名：`admin`
- 密码：`admin123`
- **重要**：部署后请立即修改密码！

## 📝 注意事项

1. **安全**：生产环境必须修改JWT_SECRET
2. **数据库**：确保数据库文件有写入权限
3. **端口**：确保防火墙开放相应端口
4. **域名**：更新BASE_URL为实际域名
5. **HTTPS**：生产环境建议使用HTTPS

## 🔧 故障排除

### 常见问题
1. **端口被占用**：修改config.env中的PORT
2. **数据库权限**：检查数据库文件权限
3. **CORS错误**：检查前端API地址配置
4. **静态文件404**：检查文件路径配置

