# 领事认证管理系统

这是一个完整的领事认证管理系统，包含后台管理界面和动态展示页面。

## 功能特性

### 后台管理系统
- ✅ 用户登录认证
- ✅ 记录管理（增删改查）
- ✅ 批量操作（删除、隐藏/显示）
- ✅ 搜索和筛选功能
- ✅ 二维码自动生成和下载
- ✅ 用户管理（管理员功能）
- ✅ 密码修改

### 动态展示页面
- ✅ 根据QR码动态显示验证结果
- ✅ 响应式设计（支持移动端）
- ✅ 错误处理和用户提示

## 技术栈

### 后端
- **Node.js** + **Express** + **TypeScript**
- **SQLite** 数据库
- **JWT** 用户认证
- **QRCode** 二维码生成
- **bcryptjs** 密码加密

### 前端
- **React** + **TypeScript**
- **Ant Design** UI组件库
- **React Router** 路由管理
- **Axios** HTTP请求

## 项目结构

```
legal.consulargo.io/
├── backend/                 # 后端API服务
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── models/         # 数据模型
│   │   ├── middleware/     # 中间件
│   │   └── utils/          # 工具函数
│   ├── uploads/            # 上传文件目录
│   └── package.json
├── frontend/               # React前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   └── contexts/       # 上下文
│   └── package.json
├── check/                  # 静态页面
│   ├── sticker8691.html    # 原始静态页面
│   └── sticker.html # 动态展示页面
└── database/               # 数据库文件
```

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3001` 启动

### 3. 启动前端应用

```bash
cd frontend
npm start
```

前端应用将在 `http://localhost:3000` 启动

### 4. 访问系统

- **后台管理**: http://localhost:3000
- **默认管理员账户**: admin / admin123

## 使用说明

### 登录系统
1. 访问 http://localhost:3000
2. 使用默认管理员账户登录：admin / admin123

### 添加记录
1. 点击"添加记录"
2. 填写所有必填字段
3. 系统会自动生成20位随机QR码
4. 保存后可以下载对应的二维码

### 管理记录
1. 在"记录管理"页面查看所有记录
2. 支持搜索、筛选和批量操作
3. 可以编辑、删除或隐藏记录
4. 可以下载单个或批量下载二维码

### 查看验证结果
1. 生成的二维码包含URL：`check/sticker?qr=20位随机字符`
2. 扫描二维码或访问URL查看验证结果
3. 动态页面会从API获取数据并显示

## API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/change-password` - 修改密码

### 记录管理
- `GET /api/records` - 获取记录列表
- `POST /api/records` - 创建新记录
- `PUT /api/records/:id` - 更新记录
- `DELETE /api/records/:id` - 删除记录
- `DELETE /api/records` - 批量删除记录
- `PATCH /api/records/status` - 批量更新状态

### 二维码相关
- `GET /api/qrcode/download/:qrCode` - 下载二维码
- `POST /api/qrcode/regenerate/:id` - 重新生成二维码
- `GET /api/qrcode/info/:qrCode` - 获取二维码信息

### 用户管理（管理员）
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

## 数据库结构

### users 表
- id: 用户ID
- username: 用户名
- password: 加密密码
- email: 邮箱
- role: 角色（admin/user）
- created_at: 创建时间

### records 表
- id: 记录ID
- qr_code: 20位随机QR码
- legalization_no: 法律编号
- issue_date: 发布日期
- place_of_issue: 发布地点
- legalization_type: 认证类型
- authorized_officer: 授权官员
- document_owner: 文档所有者
- document_type: 文档类型
- status: 状态（active/inactive）
- created_by: 创建者ID
- created_at: 创建时间
- updated_at: 更新时间

## 部署说明

### 🚀 GitHub Pages 部署（推荐）

#### 自动部署
1. **Fork 或克隆项目到您的GitHub仓库**
2. **启用 GitHub Pages**：
   - 进入仓库设置 → Pages
   - Source 选择 "GitHub Actions"
3. **推送代码到 main 分支**，GitHub Actions 会自动构建和部署

#### 手动部署
```bash
# 构建前端（适用于GitHub Pages）
cd frontend
npm run build:github

# 部署文件会在 build/ 目录中
```

#### 访问地址
- **管理系统**: `https://您的用户名.github.io/仓库名`
- **验证页面**: `https://您的用户名.github.io/仓库名/check/sticker.html`

### 🌐 Vercel 全栈部署（推荐）

#### 前端 + 后端一起部署到Vercel

**优势**：
- ✅ 前后端统一管理
- ✅ 无服务器架构，按需付费
- ✅ 全球CDN加速
- ✅ 自动HTTPS和域名管理

**快速部署**：

1. **部署后端API**：
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署后端
vercel --config vercel-backend.json --prod

# 设置环境变量
vercel env add JWT_SECRET production
```

2. **部署前端**：
```bash
cd legal.consulargo.io/frontend
vercel --prod

# 设置API地址
vercel env add REACT_APP_API_URL production
# 输入: https://your-backend.vercel.app/api
```

3. **访问应用**：
- **后端API**: `https://your-backend.vercel.app/api`
- **前端应用**: `https://your-frontend.vercel.app`

📖 **详细步骤请查看** [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md)

#### 仅前端部署到Vercel + GitHub Pages

1. **连接GitHub仓库**到Vercel
2. **配置构建设置**：
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **设置环境变量**：
   - `REACT_APP_API_URL`: 后端API地址

### 🖥️ 传统服务器部署

#### 生产环境部署
1. 修改环境变量配置
2. 构建前端应用：`npm run build`
3. 启动后端服务：`npm start`
4. 配置反向代理（如Nginx）

#### 环境变量
- `PORT`: 服务端口（默认3000）
- `JWT_SECRET`: JWT密钥
- `NODE_ENV`: 环境模式
- `DATABASE_PATH`: 数据库文件路径
- `BASE_URL`: 应用基础URL
- `CORS_ORIGIN`: 允许的跨域源

## 注意事项

1. **安全性**: 生产环境请修改默认密码和JWT密钥
2. **数据库**: 系统使用SQLite，适合中小型应用
3. **文件存储**: 二维码图片存储在服务器本地
4. **CORS**: 开发环境已配置CORS，生产环境需要调整
5. **备份**: 定期备份数据库文件

## 故障排除

### 常见问题
1. **端口冲突**: 修改config.env中的PORT配置
2. **数据库错误**: 检查数据库文件权限
3. **二维码生成失败**: 检查uploads目录权限
4. **前端无法连接后端**: 检查API地址配置

### 日志查看
- 后端日志在控制台输出
- 前端错误在浏览器控制台查看

## 🔧 GitHub 部署详细步骤

### 1. 准备GitHub仓库
```bash
# 如果还没有推送到GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/legal-admin-system.git
git push -u origin main
```

### 2. 启用GitHub Pages
1. 进入GitHub仓库页面
2. 点击 **Settings** 标签页
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 下选择 **GitHub Actions**

### 3. 配置自动部署
- GitHub Actions工作流已配置在 `.github/workflows/static-deploy.yml`
- 每次推送到main分支都会自动触发部署
- 构建完成后可在 `https://您的用户名.github.io/仓库名` 访问

### 4. 后端API部署（可选）
由于GitHub Pages只支持静态文件，后端需要单独部署：

#### 选项A：Heroku/Railway/Render 部署后端
```bash
# 进入backend目录
cd backend

# 如果使用Heroku
heroku create your-app-name
git subtree push --prefix backend heroku main
```

#### 选项B：无服务器函数（Vercel/Netlify Functions）
可以将API转换为无服务器函数部署

### 5. 更新前端API配置
在 `frontend/src/config/index.ts` 中更新 `apiUrl`：
```typescript
apiUrl: 'https://your-backend-api.com/api'
```

## 🎯 快速体验

想要快速体验系统功能？

1. **Fork 这个仓库**
2. **启用 GitHub Pages** (设置 → Pages → GitHub Actions)
3. **等待自动部署完成** (约2-3分钟)
4. **访问您的部署链接**

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的后台管理系统
- 动态展示页面
- 二维码生成和下载功能
- GitHub Pages 自动部署支持
