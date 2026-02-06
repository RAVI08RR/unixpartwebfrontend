#!/bin/bash

# Vercel Deployment Script
# This script helps deploy the application to Vercel with proper checks

echo "🚀 Vercel Deployment Script"
echo "============================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "📦 Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   This is okay for Vercel deployment (uses dashboard env vars)"
else
    echo "✅ .env.local found"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""
echo "1. Have you set NEXT_PUBLIC_API_URL in Vercel dashboard?"
echo "   → Go to: Settings > Environment Variables"
echo "   → Add: NEXT_PUBLIC_API_URL = http://srv1029267.hstgr.cloud:8000/"
echo ""
echo "2. Is your backend API accessible?"
echo "   → Test: curl http://srv1029267.hstgr.cloud:8000/"
echo ""
echo "3. Have you tested authentication locally?"
echo "   → Login, logout, protected routes"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"
echo ""

read -p "Deploy to production? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to Vercel production..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo ""
        echo "📝 Next steps:"
        echo "1. Visit your Vercel URL"
        echo "2. Test login functionality"
        echo "3. Check cookies in DevTools"
        echo "4. Verify protected routes work"
        echo "5. Check Vercel function logs for any errors"
    else
        echo "❌ Deployment failed!"
        echo "Check the error messages above"
    fi
else
    echo "ℹ️  Deployment cancelled"
    echo "   Run 'vercel --prod' manually when ready"
fi
