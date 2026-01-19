# ADR-010: CI/CD & Governance via GitHub Actions

## Status
ACCEPTED

## Context
Maintaining consistent dependency versions, coding standards, and release processes across multiple repositories is challenging. Manual enforcement leads to drift and "works on my machine" issues. We need a centralized, automated way to enforce these standards and manage releases.

## Decision
We adopt **GitHub Actions** as our standard CI/CD and Governance platform.

### 1. Automated Releases (Semantic Release)
- **Tool:** `semantic-release`
- **Trigger:** Push to `main` branch.
- **Mechanism:** Analyzes commit messages (Conventional Commits) to determine the next version number.
- **Artifacts:** Automatically generates Changelogs, GitHub Releases, and updates `package.json` version.
- **Requirement:** All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `chore:`).

### 2. Ecosystem Guard (Governance)
- **Workflow:** `ecosystem-guard.yml`
- **Trigger:** On Push and Weekly Schedule (Mondays).
- **Enforcement:**
    - **Node.js:** Enforces `engines.node` >= 20.9.0 and updates `.nvmrc` to `v20.18.0`.
    - **TypeScript:** Enforces version `^5.8.2`.
    - **Supabase:** Enforces `@supabase/supabase-js` version `^2.49.4`.
- **Auto-Fix:** The workflow automatically commits fixes to `package.json` if deviations are found.

### 3. Continuous Integration (CI)
- **Trigger:** Pull Requests and Pushes.
- **Tasks:** Linting, Type Checking, and Unit Tests (if applicable) must pass before merging.

## Consequences
- **Positive:** Guaranteed consistency across the portfolio. Reduced manual maintenance. Automated, professional changelogs.
- **Negative:** Strict commit message format required. Developers might need to pull changes frequently if the Guard commits fixes automatically.
- **Mitigation:** Use `commitizen` or pre-commit hooks to assist with commit formatting. Pull before pushing.

## Compliance
All new repositories must include the standard `.github/workflows/` set: `release.yml` and `ecosystem-guard.yml`.
