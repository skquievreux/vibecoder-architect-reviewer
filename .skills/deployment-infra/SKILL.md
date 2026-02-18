---
name: deployment-infra
description: Deployment & infrastructure skill for vibecoder-architect-reviewer. Covers Vercel (frontend/edge), Fly.io (PostgreSQL), Docker, Cloudflare DNS, and CI/CD via GitHub Actions.
---

# Deployment & Infrastructure Skill

## Project Analysis

- **Project**: vibecoder-architect-reviewer | **Type**: Hybrid Cloud — Vercel Edge + Fly.io PostgreSQL + Docker | **Compliance**: Governance OK

## Integration Plan

| Name                   | Type  | Reason                                                                     | Action / Command                          |
| :--------------------- | :---- | :------------------------------------------------------------------------- | :---------------------------------------- |
| `react-best-practices` | Skill | Next.js 16 deployed on Vercel                                              | `npx skills add vercel-labs/agent-skills` |
| `spider-mcp`           | MCP   | Docker Desktop present; Spider crawler relevant for link health monitoring | `npx add-mcp local/spider-mcp-server`     |

## Infrastructure Note

Docker is present (`Dockerfile`, `docker-compose.yml`). The project uses a **Spider-DB-MCP stack** pattern: Spider crawler for link health checks + PostgreSQL on Fly.io as persistence layer. Recommend enabling Spider-MCP for automated deployment URL health monitoring.

## Architecture Overview

```
Vercel (Global Edge)          ← Next.js 16 frontend + API routes
  └── Fly.io (fra region)     ← PostgreSQL primary + replica cluster
        └── Docker (local)    ← Dev environment + Spider crawler
              └── Cloudflare  ← DNS management + CNAME automation
```

## Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs"
}
```

**Live URL**: https://vibecode.runitfast.xyz

## Fly.io PostgreSQL

```bash
# Connect to prod DB
fly postgres connect -a <app-name>

# Run migrations in prod
pnpm exec prisma migrate deploy

# Check app status
fly status
fly logs
```

## Docker (Local Dev)

```bash
# Start services
docker compose up -d

# Check logs
docker compose logs -f

# Rebuild after Dockerfile changes
docker compose up --build
```

## GitHub Actions CI/CD

Pipeline: `.github/workflows/` — runs on push to `main`.

```yaml
# Key steps in CI
- run: pnpm install --frozen-lockfile
- run: pnpm exec prisma generate
- run: pnpm run build
# Vercel deploys automatically via Vercel GitHub integration
```

**Rule**: Never push directly to `main`. Use feature branches + PR. See `.agent/workflows/semantic-release.md`.

## Cloudflare DNS

```bash
# Managed via API — CLOUDFLARE_API_TOKEN required
pnpm dlx dotenv-cli -e .env.local -- pnpm dlx tsx scripts/sync-vercel-og.ts
```

## Required Environment Variables

```env
# Vercel (set in Vercel dashboard)
DATABASE_URL="postgresql://..."    # Fly.io connection string
NEXTAUTH_URL="https://vibecode.runitfast.xyz"

# Local dev
DATABASE_URL="file:./dev.db"
CLOUDFLARE_API_TOKEN="..."
```

## Link Health Monitoring

`pnpm maintain:audit` — audits all deployment URLs for health/latency. Integrates with Cloudflare for DNS validation.
