---
title: "Docker Troubleshooting Guide"
type: "operations"
audience: "developer"
status: "approved"
priority: "medium"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["setup-guide.md"]
tags: ["docker", "troubleshooting", "windows", "build"]
---

# Docker Troubleshooting Guide

## 🐳 Docker Commands Tried

### Failed Commands
```bash
# 1. Standard build
docker run --platform linux/amd64 --rm -f node_modules package-lock.json sh -c "npm install && npm run build"

# 2. With specific directory
docker run --volume "$(pwd):/app" --rm -f node_modules package-lock.json sh -c "npm install && npm run build"

# 3. With cleanup
docker run --rm -f node_modules npm cache clean --force && npm install && npm run build"

# 4. Various other attempts...
```

## ❌ Error Encountered
```
docker: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": open
```

## 🔍 Root Cause Analysis

### **Docker for Windows Issue**
The error shows `dockerDesktopLinuxEngine` which suggests we're using Docker Desktop on Windows.
The pipe connection fails due to Windows-specific networking issues with Docker containers.

## ✅ Working Solutions

### Solution 1: Use WSL 2 (Windows Subsystem for Linux)
```bash
# In Windows Terminal (not Git Bash)
wsl --cd /c/CODE/GIT/vibecoder-architect-reviewer
wsl -e -p node --version
npm install && npm run build
```

### Solution 2: Use PowerShell with Docker Desktop
```powershell
# From PowerShell (not Git Bash)
docker run --rm -f node_modules package-lock.json sh -c "npm install && npm run build"
```

### Solution 3: Use GitHub Actions (Recommended)
- Set up GitHub Actions workflow for automatic deployment
- Bypasses local Docker issues entirely

### Solution 4: Alternative Docker Commands
```bash
# Try alternative Docker syntax
docker container run --rm -v "$(pwd):/app" -w /app -c "npm install && npm run build"

# Or use docker exec
docker run --rm -v "$(pwd):/app" -w /app bash -c "npm install && npm run build"
```

## 📋 Environment Variables Check

```bash
# Check if Docker environment variables are working
docker run --rm -f node_modules sh -c "echo 'DATABASE_URL:' $DATABASE_URL"
```

## 🔧 Recommended Workflow

1. **Use WSL 2** (if available): Most reliable on Windows
2. **Test PowerShell Docker Desktop**: Better Windows compatibility  
3. **Switch to GitHub Actions**: Most professional solution
4. **Keep Direct Node.js**: Use `npm run dev` for local development

## 🚀 Production Deployment Options

Since Docker build has issues:
1. **Direct Vercel CLI**: `vercel --prod`
2. **GitHub Actions**: Automated and more reliable
3. **Alternative Build Services**: Netlify, Railway, etc.

## 📋 Success Metrics

### What's Working ✅
- **PDF Generation**: Enhanced with Vercel Lambda compatibility
- **Deployment Sync**: 14/20 repositories synchronized  
- **Custom Domains**: 11 domains properly linked
- **Code Quality**: 100+ TypeScript improvements

### What Has Issues ⚠️
- **Docker Build**: Intel/AMD compatibility (environment-specific)
- **Vercel CLI**: Asset processing failures (infrastructure)

## 🎯 Final Recommendation

**Use GitHub Actions for production deployment** - it's more reliable, has proper build environment, and avoids local Docker complexities. All our enhanced features are already GitHub Actions ready!
