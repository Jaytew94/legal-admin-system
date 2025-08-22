#!/bin/bash

# 🚀 领事认证管理系统 - Vercel 全栈部署脚本

echo "🚀 开始部署领事认证管理系统到Vercel..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 登录Vercel
echo "🔐 登录Vercel..."
vercel login

echo ""
echo "选择部署方案："
echo "1. 仅部署后端API"
echo "2. 仅部署前端"
echo "3. 全栈部署（推荐）"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo "🔧 部署后端API到Vercel..."
        
        # 部署后端
        vercel --config vercel-backend.json --prod
        
        echo ""
        echo "🔑 设置环境变量..."
        echo "请设置JWT密钥："
        vercel env add JWT_SECRET production
        
        echo ""
        echo "✅ 后端API部署完成！"
        echo "📋 接下来的步骤："
        echo "1. 记录您的后端URL：https://your-project.vercel.app"
        echo "2. 在前端配置中更新API地址"
        ;;
        
    2)
        echo "🎨 部署前端到Vercel..."
        
        cd legal.consulargo.io/frontend
        
        # 部署前端
        vercel --prod
        
        echo ""
        echo "🔗 设置API地址..."
        echo "请输入您的后端API地址："
        vercel env add REACT_APP_API_URL production
        
        echo ""
        echo "✅ 前端部署完成！"
        ;;
        
    3)
        echo "🌟 全栈部署到Vercel..."
        
        # 1. 部署后端
        echo "📡 第1步：部署后端API..."
        vercel --config vercel-backend.json --prod
        
        echo ""
        echo "🔑 设置后端环境变量..."
        echo "请设置JWT密钥："
        vercel env add JWT_SECRET production
        
        # 获取后端URL
        echo ""
        read -p "请输入刚刚部署的后端URL (https://your-backend.vercel.app): " backend_url
        
        # 2. 部署前端
        echo ""
        echo "🎨 第2步：部署前端..."
        cd legal.consulargo.io/frontend
        
        vercel --prod
        
        echo ""
        echo "🔗 设置前端环境变量..."
        vercel env add REACT_APP_API_URL production --value "${backend_url}/api"
        
        echo ""
        echo "🎉 全栈部署完成！"
        echo ""
        echo "📱 您的应用现在可以访问："
        echo "🔗 前端: https://your-frontend.vercel.app"
        echo "🔧 后端: ${backend_url}"
        echo ""
        echo "📝 默认管理员账户："
        echo "   用户名: admin"
        echo "   密码: admin123"
        echo "   ⚠️  请登录后立即修改密码！"
        ;;
        
    *)
        echo "❌ 无效选择，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
echo "📖 详细配置说明请查看："
echo "   - VERCEL_DEPLOY.md (Vercel部署指南)"
echo "   - GITHUB_DEPLOY.md (GitHub部署指南)"
echo ""
echo "🆘 需要帮助？"
echo "   - Vercel文档: https://vercel.com/docs"
echo "   - 项目GitHub: https://github.com/您的用户名/legal-admin-system"
echo ""
echo "✨ 部署脚本执行完成！"
