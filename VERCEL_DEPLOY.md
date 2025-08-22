# 🚀 Vercel 全栈部署指南

这个文档详细说明如何将领事认证管理系统的前端和后端都部署到Vercel。

## 📋 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel 部署                           │
├─────────────────────────────────────────────────────────────┤
│  前端项目 (React)                                            │
│  ├── GitHub Pages 或 Vercel Frontend                        │
│  └── API 配置指向 Vercel Backend                             │
├─────────────────────────────────────────────────────────────┤
│  后端 API (Node.js 无服务器函数)                             │
│  ├── /api/index.ts - 统一API入口                             │
│  ├── Express 路由转换为无服务器函数                          │
│  ├── 临时文件存储 (/tmp)                                     │
│  └── SQLite 数据库 (临时) 或外部数据库                        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 快速部署（推荐方案）

### 方案A：分别部署前后端

#### 1. 部署后端API到Vercel

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 在项目根目录，使用后端配置部署
cd /path/to/legal-admin-system
vercel --cwd . --config vercel-backend.json

# 3. 设置环境变量
vercel env add JWT_SECRET production
# 输入一个强密码，比如：your-super-secret-jwt-key-2024

# 4. 部署到生产环境
vercel --prod --config vercel-backend.json
```

#### 2. 部署前端到Vercel

```bash
# 进入前端目录
cd legal.consulargo.io/frontend

# 使用前端配置部署
vercel

# 设置API URL环境变量
vercel env add REACT_APP_API_URL production
# 输入您的后端API地址：https://your-backend-project.vercel.app/api

# 部署到生产环境
vercel --prod
```

### 方案B：前端使用GitHub Pages + 后端使用Vercel

#### 1. 后端部署到Vercel（同上）

#### 2. 前端部署到GitHub Pages

```bash
# 更新前端配置，指向Vercel后端
# 编辑 legal.consulargo.io/frontend/src/config/index.ts
# 将 'https://legal-admin-system-api.vercel.app/api' 替换为您的实际后端地址

# 推送到GitHub，自动部署
git add .
git commit -m "配置Vercel后端API"
git push origin main
```

## 📝 详细配置步骤

### 1. Vercel账户准备

1. 访问 [vercel.com](https://vercel.com) 注册账户
2. 连接您的GitHub账户
3. 安装Vercel CLI：`npm i -g vercel`

### 2. 后端API部署

#### 创建后端项目

在项目根目录：

```bash
# 登录Vercel
vercel login

# 部署后端（首次）
vercel --config vercel-backend.json

# 选择项目设置：
# Set up and deploy? Y
# Which scope? (选择您的账户)
# Link to existing project? N
# Project name: legal-admin-system-api
# In which directory? ./
# Override settings? Y
```

#### 配置环境变量

在Vercel控制台或通过CLI设置：

```bash
# 必需的环境变量
vercel env add NODE_ENV production
vercel env add JWT_SECRET production  # 输入强密码

# 可选的环境变量
vercel env add DATABASE_URL production  # 如果使用外部数据库
```

#### 部署到生产环境

```bash
vercel --prod --config vercel-backend.json
```

### 3. 前端部署

#### 选项A：部署到Vercel

```bash
cd legal.consulargo.io/frontend

# 首次部署
vercel

# 项目设置：
# Set up and deploy? Y
# Which scope? (选择您的账户)
# Link to existing project? N
# Project name: legal-admin-system-frontend
# In which directory? ./
# Override settings? Y

# 设置环境变量
vercel env add REACT_APP_API_URL production
# 输入: https://your-backend-project.vercel.app/api

# 生产部署
vercel --prod
```

#### 选项B：继续使用GitHub Pages

更新前端配置文件：

```typescript
// legal.consulargo.io/frontend/src/config/index.ts
// 更新这行：
return 'https://your-actual-backend-url.vercel.app/api';
```

然后推送到GitHub。

### 4. 数据库配置（重要）

**注意**：Vercel无服务器函数使用临时存储，SQLite数据在冷启动时会丢失。

#### 推荐的生产数据库方案

1. **Vercel Postgres**（推荐）
```bash
# 在Vercel控制台添加Postgres数据库
# 或通过CLI：
vercel integrate add postgres
```

2. **PlanetScale** (MySQL)
```bash
# 注册 https://planetscale.com
# 创建数据库并获取连接字符串
vercel env add DATABASE_URL production
# 输入: mysql://username:password@host/database?sslaccept=strict
```

3. **Supabase** (PostgreSQL)
```bash
# 注册 https://supabase.com
# 创建项目并获取数据库URL
vercel env add DATABASE_URL production
# 输入: postgresql://username:password@host:port/database
```

#### 数据库迁移

如果使用外部数据库，需要更新 `api/lib/database.ts`：

```typescript
// 示例：PostgreSQL连接
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 5. 文件存储配置

#### 选项A：Vercel Blob Storage（推荐）

```bash
# 添加Vercel Blob到项目
vercel integrate add blob

# 更新环境变量
vercel env add BLOB_READ_WRITE_TOKEN production
```

在代码中使用：

```typescript
import { put, del } from '@vercel/blob';

export async function uploadQRCode(buffer: Buffer, filename: string): Promise<string> {
  const blob = await put(`qrcodes/${filename}.png`, buffer, {
    access: 'public',
  });
  return blob.url;
}
```

#### 选项B：其他云存储

- **AWS S3**
- **Cloudinary**
- **Uploadcare**

## 🔧 部署后配置

### 1. 验证部署

访问以下URL确认部署成功：

- 后端健康检查：`https://your-backend.vercel.app/api/health`
- 前端应用：`https://your-frontend.vercel.app`

### 2. 域名配置（可选）

在Vercel控制台：
1. 进入项目设置
2. 点击 "Domains"
3. 添加自定义域名
4. 按提示配置DNS

### 3. 环境变量管理

```bash
# 查看所有环境变量
vercel env ls

# 添加新变量
vercel env add VARIABLE_NAME production

# 删除变量
vercel env rm VARIABLE_NAME production
```

## 🐛 故障排除

### 常见问题

1. **API 404错误**
   ```bash
   # 检查函数部署状态
   vercel logs your-backend-project.vercel.app
   ```

2. **CORS错误**
   - 确认前端域名已添加到CORS配置
   - 检查 `api/index.ts` 中的CORS设置

3. **数据库连接失败**
   - 验证 `DATABASE_URL` 环境变量
   - 检查数据库服务器状态

4. **文件上传失败**
   - 确认存储配置正确
   - 检查文件大小限制（Vercel限制：4.5MB）

### 日志查看

```bash
# 实时日志
vercel logs --follow your-project.vercel.app

# 特定函数日志
vercel logs your-project.vercel.app/api/index
```

### 本地调试

```bash
# 在项目根目录
vercel dev --config vercel-backend.json

# 前端开发
cd legal.consulargo.io/frontend
npm start
```

## 📈 性能优化

### 1. 函数优化

- 使用连接池减少数据库连接开销
- 实现适当的缓存策略
- 优化包大小和依赖

### 2. 前端优化

- 启用CDN缓存
- 压缩静态资源
- 使用React.lazy进行代码分割

## 💡 最佳实践

1. **环境管理**：为开发、预览、生产环境分别配置
2. **监控**：设置错误监控和性能监控
3. **备份**：定期备份数据库
4. **安全**：定期更新JWT密钥和密码
5. **版本控制**：使用Git标签管理发布版本

## 🆘 需要帮助？

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [Node.js 运行时文档](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

---

🎉 **恭喜！您的领事认证管理系统已成功部署到Vercel！**

部署完成后，您将拥有：
- 🌐 全功能的Web应用
- 🔄 自动化的CI/CD流水线
- 📊 实时的性能监控
- 🔒 安全的生产环境
