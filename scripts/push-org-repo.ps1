# Setup Script for Organization Repository
# Run this from PowerShell

Write-Host "🚀 Setting up Organization Repository..." -ForegroundColor Cyan
Write-Host ""

$targetDir = "C:\CODE\GIT\.github-org-temp"

# Change to target directory
Set-Location $targetDir

# Initialize git
Write-Host "📁 Initializing git repository..." -ForegroundColor Green
git init

# Create README if not exists
if (-not (Test-Path "README.md")) {
    Write-Host "📝 Creating README.md..." -ForegroundColor Green
    @"
# skquievreux GitHub Actions Templates

This repository contains organization-wide GitHub Actions workflow templates.

## Available Workflow Templates

- **CI Pipeline** (ci.yml) - Continuous Integration
- **Semantic Release** (release.yml) - Automated versioning
- **Dashboard Sync** (dashboard-sync.yml) - Documentation sync
- **Ecosystem Guard** (ecosystem-guard.yml) - Security monitoring
- **Rollout Standards** (rollout-standards.yml) - Deployment governance

## How to Use

These templates appear automatically in the Actions tab of new repositories.

Go to Actions → New workflow → Look for "Workflows created by skquievreux"

## Documentation

See: https://github.com/skquievreux/vibecoder-architect-reviewer/blob/main/docs/adr/011-organization-workflow-templates.md

---

Last Updated: 2025-12-17
Maintained by: skquievreux DevOps Team
"@ | Out-File -FilePath "README.md" -Encoding UTF8
}

# Add all files
Write-Host "📦 Adding files..." -ForegroundColor Green
git add .

# Commit
Write-Host "💾 Committing..." -ForegroundColor Green
git commit -m "feat: add organization-wide workflow templates

- Add 5 standardized workflow templates (CI, Release, Dashboard, Security, Rollout)
- Include metadata for GitHub UI integration
- Add comprehensive documentation

Implements ADR-011"

# Add remote
Write-Host "🔗 Adding remote..." -ForegroundColor Green
git remote add origin https://github.com/skquievreux/Organisation-Repo.git

# Rename branch
Write-Host "🌿 Setting main branch..." -ForegroundColor Green
git branch -M main

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host ""
Write-Host "✅ Done! Check: https://github.com/skquievreux/Organisation-Repo" -ForegroundColor Green
Write-Host ""
