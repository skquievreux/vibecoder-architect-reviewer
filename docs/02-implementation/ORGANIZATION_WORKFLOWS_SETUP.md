---
title: "Organization-Wide GitHub Actions Setup Guide"
type: "implementation"
audience: "developer"
status: "approved"
priority: "high"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["ADR_011_COMPLETE_PLAN.md"]
tags: ["github-actions", "setup", "organization", "templates"]
---

# Organization-Wide GitHub Actions Setup Guide

This guide explains how to implement organization-wide GitHub Actions workflow templates as documented in [ADR-011](../docs/adr/011-organization-workflow-templates.md).

## 📋 Overview

We've created a standardized set of GitHub Actions workflows that should be available to all repositories in the organization:

- **CI Pipeline** - Linting, building, and verification
- **Semantic Release** - Automated versioning and changelog
- **Dashboard Sync** - Documentation and metrics synchronization
- **Ecosystem Guard** - Security and dependency monitoring
- **Rollout Standards** - Deployment governance

## 🚀 Quick Start

### Prerequisites

1. **GitHub CLI** installed and authenticated:
   ```bash
   gh --version
   gh auth login
   ```

2. **Organization admin access** to create repositories

### Automated Setup

Run the setup script to create the organization `.github` repository:

```bash
# Replace 'your-org' with your GitHub organization name
npx tsx scripts/setup-organization-workflows.ts --org your-org
```

This will:
1. ✅ Create `your-org/.github` repository (if it doesn't exist)
2. ✅ Copy all workflow templates and metadata
3. ✅ Generate comprehensive README
4. ✅ Commit and push changes

### Dry Run

To preview what will happen without making changes:

```bash
npx tsx scripts/setup-organization-workflows.ts --org your-org --dry-run
```

## 📁 What Gets Created

```
your-org/.github/
├── workflow-templates/
├── ci.yml
├── ci.properties.json
├── release.yml
├── release.properties.json
├── dashboard-sync.yml
├── dashboard-sync.properties.json
├── ecosystem-guard.yml
├── ecosystem-guard.properties.json
├── rollout-standards.yml
└── rollout-standards.properties.json
└── README.md
```

## 🎯 Using Templates in New Repositories

### Via GitHub Web UI

1. Create a new repository or navigate to an existing one
2. Go to the **Actions** tab
3. Click **New workflow**
4. Scroll to **"Workflows created by [your-org]"**
5. Select a template and click **Configure**
6. Commit the workflow file

### Via Command Line

```bash
# Clone your new repository
gh repo clone your-org/new-repo
cd new-repo

# Create workflows directory
mkdir -p .github/workflows

# Copy a template
gh repo clone your-org/.github temp-templates
cp temp-templates/workflow-templates/ci.yml .github/workflows/
rm -rf temp-templates

# Commit and push
git add .github/workflows/ci.yml
git commit -m "chore: add CI workflow"
git push
```

## 🔧 Repository Configuration

For workflows to function correctly, ensure your repository has:

### Required Scripts in `package.json`

```json
{
  "scripts": {
    "lint": "eslint .",
    "build": "next build",
    "verify": "npm run lint && npm run build"
  }
}
```

### Required Secrets (for Release workflow)

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add `GH_TOKEN`:
   - Create a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope
   - Add it as a repository secret named `GH_TOKEN`

### Semantic Release Configuration

Create `.releaserc.json`:

```json
{
  "branches": ["main", "master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}
```

## 📝 Workflow Details

### CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main`/`master`
- Pull requests to `main`/`master`

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run linting
5. Build project
6. Run verification tests

**No secrets required**

---

### Semantic Release (`release.yml`)

**Triggers:**
- Push to `main`/`master`

**Steps:**
1. Analyze commits (conventional commits)
2. Determine next version
3. Generate changelog
4. Create GitHub release
5. Update package.json

**Required secrets:**
- `GH_TOKEN`

---

### Dashboard Sync (`dashboard-sync.yml`)

**Triggers:**
- Schedule (daily at 2 AM UTC)
- Manual dispatch

**Steps:**
1. Sync documentation
2. Update metrics
3. Generate reports

**Project-specific configuration required**

---

### Ecosystem Guard (`ecosystem-guard.yml`)

**Triggers:**
- Schedule (weekly on Monday)
- Pull requests
- Manual dispatch

**Steps:**
1. Dependency audit
2. Security vulnerability scan
3. License compliance check
4. Health score calculation

**No secrets required**

---

### Rollout Standards (`rollout-standards.yml`)

**Triggers:**
- Manual dispatch
- Release creation

**Steps:**
1. Quality gate checks
2. Deployment validation
3. Rollback plan verification

**Deployment-specific secrets required**

## 🔄 Updating Templates

### 1. Update Source Templates

Edit the workflow files in this repository:

```bash
cd vibecoder-architect-reviewer
# Edit files in workflow-templates/
```

### 2. Re-run Setup Script

```bash
npx tsx scripts/setup-organization-workflows.ts --org your-org
```

### 3. Update Existing Repositories

Templates are **not** automatically updated in existing repositories. You must:

**Option A: Manual Update**
```bash
# In each repository
cp /path/to/.github/workflow-templates/ci.yml .github/workflows/
git commit -m "chore: update CI workflow"
git push
```

**Option B: Bulk Update Script** (future enhancement)
```bash
# TODO: Create script to update all org repositories
npx tsx scripts/bulk-update-workflows.ts --org your-org
```

## 🧪 Testing

### Test in a New Repository

1. Create a test repository:
   ```bash
   gh repo create your-org/workflow-test --public
   ```

2. Add a workflow from templates via the GitHub UI

3. Verify it appears and runs correctly

### Test Locally

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
choco install act  # Windows

# Run a workflow locally
cd your-repo
act -l  # List workflows
act push  # Simulate push event
```

## 📚 Additional Resources

- [ADR-011: Organization-Wide Workflow Templates](../docs/adr/011-organization-workflow-templates.md)
- [GitHub: Creating Workflow Templates](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🐛 Troubleshooting

### Templates Don't Appear in GitHub UI

1. Verify `.github` repository is public
2. Check `workflow-templates/` directory structure
3. Ensure `.properties.json` files are valid JSON
4. Wait a few minutes for GitHub to index

### Workflow Fails to Run

1. Check required secrets are configured
2. Verify `package.json` scripts exist
3. Review workflow logs in Actions tab
4. Ensure branch protection rules allow Actions

### Permission Errors

1. Verify `GH_TOKEN` has correct scopes
2. Check repository settings → Actions → General
3. Enable "Read and write permissions" for GITHUB_TOKEN

---

**Last Updated**: 2025-12-17  
**Maintained by**: DevOps Team
