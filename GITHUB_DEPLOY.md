# 🚀 GitHub 部署指南

这个文档详细说明如何将领事认证管理系统部署到GitHub Pages。

## 📋 部署前准备

### 1. 确保项目结构正确
```
legal-admin-system/
├── .github/workflows/          # GitHub Actions 工作流
├── legal.consulargo.io/        # 主要项目目录
│   ├── frontend/               # React 前端
│   ├── backend/                # Node.js 后端
│   └── README.md
├── check/                      # 静态验证页面
├── vercel.json                 # Vercel 配置
└── GITHUB_DEPLOY.md           # 本文档
```

### 2. 检查配置文件
- ✅ `.github/workflows/static-deploy.yml` - GitHub Actions 工作流
- ✅ `frontend/package.json` - 包含 `build:github` 脚本
- ✅ `frontend/src/config/index.ts` - 环境配置管理

## 🌟 快速部署（3分钟搞定）

### 步骤1: Fork/克隆到您的GitHub

#### 选项A: Fork 现有仓库
1. 点击仓库右上角的 **Fork** 按钮
2. 选择您的GitHub账户
3. 等待Fork完成

#### 选项B: 上传新仓库
```bash
# 在项目根目录执行
git init
git add .
git commit -m "🎉 Initial commit: 领事认证管理系统"
git branch -M main
git remote add origin https://github.com/您的用户名/legal-admin-system.git
git push -u origin main
```

### 步骤2: 启用GitHub Pages
1. 进入您的GitHub仓库
2. 点击 **Settings** 标签页
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 下选择 **"GitHub Actions"**
5. 点击 **Save**

### 步骤3: 等待自动部署
- 推送代码后，GitHub Actions 会自动开始构建
- 在 **Actions** 标签页可以查看构建进度
- 构建通常需要2-3分钟

### 步骤4: 访问您的网站
- 🌐 **主页**: `https://您的用户名.github.io/legal-admin-system`
- 📊 **管理系统**: `https://您的用户名.github.io/legal-admin-system/static/js/`
- 🔍 **验证页面**: `https://您的用户名.github.io/legal-admin-system/check/sticker.html`

## 🔧 自定义配置

### 修改仓库名称
如果您想使用不同的仓库名称：

1. **更新 GitHub Actions 工作流** (`.github/workflows/static-deploy.yml`):
```yaml
env:
  PUBLIC_URL: /您的新仓库名
```

2. **更新前端配置** (`frontend/package.json`):
```json
{
  "homepage": "https://您的用户名.github.io/您的新仓库名",
  "scripts": {
    "build:github": "PUBLIC_URL=/您的新仓库名 react-scripts build"
  }
}
```

### 配置后端API
由于GitHub Pages只支持静态文件，后端需要单独部署：

#### 推荐方案：
1. **Railway** - `railway.app`
2. **Render** - `render.com`
3. **Heroku** - `heroku.com`
4. **Vercel Functions** - 无服务器函数

#### 更新API地址：
修改 `frontend/src/config/index.ts`:
```typescript
const config = {
  apiUrl: 'https://your-backend-api.com/api', // 替换为实际后端地址
  // ...其他配置
};
```

## 🐛 故障排除

### 构建失败
1. **检查Actions日志**:
   - 进入仓库 → Actions → 点击失败的工作流
   - 查看详细错误信息

2. **常见问题**:
   - Node.js版本不兼容 → 检查 `.github/workflows/static-deploy.yml` 中的node-version
   - 依赖安装失败 → 确保 `package-lock.json` 存在
   - 构建脚本错误 → 检查 `package.json` 中的scripts

### 404错误
1. **确保GitHub Pages已启用**
2. **检查URL路径**是否正确
3. **等待DNS传播**（最多10分钟）

### 页面显示异常
1. **检查控制台错误**
2. **确认资源路径**正确
3. **清除浏览器缓存**

## 🔄 更新部署

每次推送到 `main` 分支都会自动触发重新部署：

```bash
git add .
git commit -m "✨ 更新功能"
git push origin main
```

## 📈 高级配置

### 自定义域名
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容写入您的域名：`your-domain.com`
3. 在域名DNS设置中添加CNAME记录指向 `您的用户名.github.io`

### 环境变量
在GitHub仓库设置中添加Secrets：
1. 进入 Settings → Secrets and variables → Actions
2. 添加新的Repository secret
3. 在工作流中使用：`${{ secrets.YOUR_SECRET }}`

## 🎯 部署检查清单

- [ ] 仓库已推送到GitHub
- [ ] GitHub Pages已启用并选择"GitHub Actions"
- [ ] `.github/workflows/static-deploy.yml` 文件存在
- [ ] 构建成功完成（绿色✅）
- [ ] 网站可以正常访问
- [ ] 前端页面显示正常
- [ ] 静态验证页面工作正常

## 💡 提示和技巧

1. **预览部署**：可以在本地运行 `npm run build:github` 预览构建结果
2. **分支保护**：考虑设置分支保护规则，要求通过检查才能合并
3. **自动化测试**：在工作流中添加测试步骤
4. **缓存优化**：GitHub Actions 已配置npm缓存，加速构建
5. **监控部署**：关注Actions页面，及时发现构建问题

## 🆘 需要帮助？

如果遇到问题：

1. **检查官方文档**：[GitHub Pages 文档](https://docs.github.com/pages)
2. **查看示例仓库**：寻找类似项目的配置
3. **社区求助**：GitHub Discussions 或相关技术论坛

---

🎉 **恭喜！您的领事认证管理系统已成功部署到GitHub Pages！**
