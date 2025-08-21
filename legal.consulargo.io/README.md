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

### 生产环境部署
1. 修改环境变量配置
2. 构建前端应用：`npm run build`
3. 启动后端服务：`npm start`
4. 配置反向代理（如Nginx）

### 环境变量
- `PORT`: 服务端口（默认3001）
- `JWT_SECRET`: JWT密钥
- `NODE_ENV`: 环境模式
- `DATABASE_PATH`: 数据库文件路径

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

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的后台管理系统
- 动态展示页面
- 二维码生成和下载功能
