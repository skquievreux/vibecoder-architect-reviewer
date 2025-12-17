#!/bin/bash
# Setup Script for Organization Repository
# Run this from C:\CODE\GIT\.github-org-temp

echo "🚀 Setting up Organization Repository..."
echo ""

# Initialize git
echo "📁 Initializing git repository..."
git init

# Create README if not exists
if [ ! -f "README.md" ]; then
    cat > README.md << 'EOF'
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
EOF
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Committing..."
git commit -m "feat: add organization-wide workflow templates

- Add 5 standardized workflow templates (CI, Release, Dashboard, Security, Rollout)
- Include metadata for GitHub UI integration
- Add comprehensive documentation

Implements ADR-011"

# Add remote
echo "🔗 Adding remote..."
git remote add origin https://github.com/skquievreux/Organisation-Repo.git

# Rename branch
echo "🌿 Setting main branch..."
git branch -M main

# Push
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Check: https://github.com/skquievreux/Organisation-Repo"
echo ""
