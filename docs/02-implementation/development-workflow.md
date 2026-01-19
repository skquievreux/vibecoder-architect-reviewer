---
title: "Development & Agent Workflow Best Practices"
type: "implementation"
audience: "developer"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-29"
updated: "2025-12-29"
reviewers: ["@steff", "@antigravity"]
related: ["workflow-guide.md", "GOVERNANCE_FRAMEWORK.md"]
tags: ["workflow", "git", "agent", "best-practices", "ci-cd"]
---

# 🚀 Development Workflow Best Practices

This document defines the mandatory workflow for all contributors, including **AI Agents**, to ensure stability, avoid merge conflicts with the automated Semantic Release bot, and maintain a clean production branch.

## 🛡️ The Golden Rule
**NEVER PUSH DIRECTLY TO `main`.**

The `main` branch is protected and managed by automated release tools. Direct pushes bypass quality checks and cause versioning conflicts.

---

## 🔄 Standard Git Workflow (Mandatory for Agents)

Follow these steps for every task:

### 1. Create a Feature Branch
Always start from the latest `main` and create a descriptive branch.
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name  # or fix/issue-description
```

### 2. Implementation & Push
Commit your changes using **Conventional Commits** and push the branch early to the remote repository.
```bash
git add .
git commit -m "feat: description of work"
git push origin feature/your-feature-name
```

### 3. Sync & Rebase
Before finalizing, ensure your branch is up-to-date with `main` to handle any changes made by the Semantic Release bot or other developers.
```bash
git fetch origin main
git rebase origin/main
```

### 4. Final Push & Pull Request
Push the rebased changes (use `--force-with-lease` if the rebase changed history) and open a Pull Request on GitHub.
```bash
git push origin feature/your-feature-name --force-with-lease
# Open PR at https://github.com/skquievreux/vibecoder-architect-reviewer/compare
```

---

## 🤖 Special Instructions for AI Agents (Antigravity)

1. **Verify State**: Before any operation, run `git status` and `git branch -vv`.
2. **Handle Conflicts**: If a push to a feature branch is rejected, **ALWAYS** `git pull --rebase origin <branch>` before attempting to push again.
3. **PR Creation**: If `gh` CLI is available, use it to create the PR. Otherwise, provide the user with the direct comparison URL.
4. **Semantic Release Compliance**: Never manually edit `package.json` version or `CHANGELOG.md`. Let the bot handle it after the PR is merged.

---

## 🚦 Pull Request Checklist

- [ ] Branch is based on the latest `main`.
- [ ] Conventional commit messages are used.
- [ ] No manual changes to `package.json` version.
- [ ] All tests/builds pass locally.
- [ ] Documentation updated if necessary.

---

*This workflow is enforced to maintain the health of the Vibecoder Architect Reviewer ecosystem.*
