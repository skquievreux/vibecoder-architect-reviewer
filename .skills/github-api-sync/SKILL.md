---
name: github-api-sync
description: GitHub API integration skill for vibecoder-architect-reviewer. Covers repo sync pipeline, rate limiting, private repo access, and portfolio intelligence refresh.
---

# GitHub API Sync Skill

## Project Analysis

- **Project**: vibecoder-architect-reviewer | **Type**: GitHub REST API / 60+ repos (public + private) | **Compliance**: Governance OK

## Integration Plan

| Name                   | Type  | Reason                                                      | Action / Command                          |
| :--------------------- | :---- | :---------------------------------------------------------- | :---------------------------------------- |
| `react-best-practices` | Skill | Next.js 16 frontend consuming sync data                     | `npx skills add vercel-labs/agent-skills` |
| `spider-mcp`           | MCP   | Docker detected + web scraping relevant for repo enrichment | `npx add-mcp local/spider-mcp-server`     |

## Infrastructure Note

Docker is present. If repo enrichment via web scraping is needed (e.g. pulling live deployment metadata), recommend the **Spider-DB-MCP stack**: Spider crawler container + PostgreSQL sidecar. See `docker-compose.yml` for existing setup.

## Sync Commands

```bash
pnpm refresh-data          # GitHub → DB sync (uses .env.local)
pnpm portfolio:refresh     # Full pipeline: GitHub → AI analysis → DB
pnpm sync:vercel-og        # Sync Vercel deployment URLs + OG images
pnpm enrich                # Enrich portfolio with additional metadata
```

## Core Files

```
src/lib/github-sync.ts              # Main sync logic
scripts/intelligence/pipeline.ts    # Full enrichment pipeline
scripts/sync-vercel-og.ts           # Vercel OG sync
interfaces-registry.yaml            # Auto-generated API/service registry
```

## Rate Limiting Pattern

GitHub API: 5000 req/hour (authenticated). For bulk operations:

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (const repo of repos) {
  await processRepo(repo);
  await delay(100); // 100ms between calls → safe at 5000/h
}
```

## Required Environment Variables

```env
GITHUB_TOKEN="ghp_..."      # Needs: repo (private access) + read:org
GITHUB_OWNER="skquievreux"
```

## Common Issues

| Issue            | Cause                | Fix                            |
| :--------------- | :------------------- | :----------------------------- |
| 401 Unauthorized | Token scope missing  | Add `repo` + `read:org` to PAT |
| 403 Rate Limited | Too many requests    | Add `delay(100)` between calls |
| Stale data       | New repos not synced | Run `pnpm refresh-data`        |
