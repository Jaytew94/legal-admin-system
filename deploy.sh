#!/bin/bash

# 🚀 领事认证管理系统 - GitHub 部署脚本
echo "🚀 开始部署领事认证管理系统到GitHub..."

# 检查Git状态
if ! git status &>/dev/null; then
    echo "📦 初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加所有文件
echo "📁 添加文件到Git..."
git add .

# 提交更改
echo "💾 提交更改..."
if [ -z "$1" ]; then
    git commit -m "🎉 部署领事认证管理系统到GitHub Pages"
else
    git commit -m "$1"
fi

# 检查是否已设置远程仓库
if ! git remote get-url origin &>/dev/null; then
    echo "⚠️  请设置远程仓库地址："
    echo "   git remote add origin https://github.com/您的用户名/legal-admin-system.git"
    echo "   然后重新运行此脚本"
    exit 1
fi

# 推送到GitHub
echo "🌐 推送到GitHub..."
git push -u origin main

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 进入GitHub仓库页面"
echo "2. 点击 Settings → Pages"
echo "3. Source选择 'GitHub Actions'"
echo "4. 等待2-3分钟完成构建"
echo ""
echo "🌐 您的网站将在以下地址可用："
echo "   https://您的用户名.github.io/legal-admin-system"
echo ""
echo "📖 详细说明请查看 GITHUB_DEPLOY.md"
