---
title: "AI Agents Guidelines & Commands"
type: "architecture"
audience: "developer"
status: "approved"
priority: "high"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["architecture.md"]
tags: ["agents", "guidelines", "commands", "linting"]
---

# AGENTS.md

## Build/Lint/Test Commands

### Dashboard (Next.js/TypeScript)
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Verify**: `npm run verify`
- **Single test**: No test runner configured

### Analysis (Python)
- **Run**: `cd analysis && python analyzer.py`
- **Lint**: `cd analysis && flake8 analyzer.py` or `black --check analyzer.py`
- **Test**: No test framework configured

## Code Style Guidelines

### TypeScript/React (Dashboard)
- **Strict mode**: Enabled in tsconfig.json
- **Target**: ES2017 with modern lib support
- **JSX**: React JSX syntax
- **Imports**: ES modules, use `@/*` path alias for app directory
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error handling**: Use try/catch blocks, avoid throwing in components
- **Types**: Explicit typing required, use interfaces for complex objects

### Python (Analysis)
- **Imports**: Standard library first, then third-party, alphabetical order
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Error handling**: Use try/except blocks with specific exceptions
- **Docstrings**: Use triple quotes for function documentation

### General
- **Formatting**: ESLint handles JS/TS, manual formatting for Python
- **Commits**: Use conventional commit messages
- **Secrets**: Never commit API keys, tokens, or sensitive config
