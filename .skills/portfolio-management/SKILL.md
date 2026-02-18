---
name: portfolio-management
description: Portfolio management skill for vibecoder-architect-reviewer. Covers the 25-repo portfolio data model, ADR management, business canvas, and the maintenance/audit pipeline.
---

# Portfolio Management Skill

## Project Analysis

- **Project**: vibecoder-architect-reviewer | **Type**: Portfolio Management / 25 repos / ADRs / Business Intelligence | **Compliance**: Governance OK

## Integration Plan

| Name                   | Type  | Reason                                                      | Action / Command                            |
| :--------------------- | :---- | :---------------------------------------------------------- | :------------------------------------------ |
| `react-best-practices` | Skill | Next.js 16 portfolio dashboard                              | `npx skills add vercel-labs/agent-skills`   |
| `shadcn-ui`            | Skill | Tremor + Tailwind component library in use                  | `npx skills add google-labs-code/shadcn-ui` |
| `spider-mcp`           | MCP   | Docker present; link health monitoring for 25 deployed apps | `npx add-mcp local/spider-mcp-server`       |

## Infrastructure Note

Docker is present. For automated link health checks across all 25 portfolio deployments, the **Spider-DB-MCP stack** is recommended: Spider crawler scans all deployment URLs, results stored in PostgreSQL, surfaced in the dashboard.

## Portfolio Data

```
portfolio.json              # Source of truth — 25 repos, tech stacks, costs
PROJEKT_UEBERSICHT.md       # Human-readable overview
interfaces-registry.yaml    # Auto-generated API/service registry per repo
```

**Stats**: 25 projects | 16 with Supabase | ~€400/month estimated costs | Main stack: React + TypeScript + Next.js + Tailwind + Supabase

## Key Maintenance Scripts

```bash
pnpm maintain:verify        # Verify task integrity across repos
pnpm maintain:audit         # Full ecosystem audit (health, costs, compliance)
pnpm maintain:node          # Standardize Node.js versions across all repos
pnpm sync:local-files       # Sync local file metadata to DB
```

## ADR Management

13 predefined ADRs in `prisma/` — seeded via:

```bash
pnpm dlx tsx scripts/seed-adrs.ts
```

ADR statuses: `Proposed` → `Accepted` → `Deprecated`. Never delete — always deprecate.

## Business Canvas Model

Each repo has a business canvas with:
- `valueProposition` — what problem it solves
- `customerSegments` — target users + pain points
- `revenueStreams` — ARR estimates
- `costStructure` — monthly cost tracking

Populated via: `src/lib/business-canvas-analyzer.ts` (AI-driven).

## Governance Compliance Check

When adding a new repo to the portfolio:

```bash
# 1. Add to portfolio.json
# 2. Run sync
pnpm refresh-data

# 3. Generate interface registry
pnpm dlx tsx scripts/generate-interface-registry.ts

# 4. Run audit
pnpm maintain:audit
```

**Compliance flags**:
- ⚠️ `requirements.txt` without `pyproject.toml` → Legacy Python, flag for Poetry migration
- ⚠️ Missing `pnpm-lock.yaml` → flag for pnpm migration
- ❌ `package-lock.json` or `yarn.lock` present → must remove

## Provider Management

Deployment providers (Vercel, Netlify, Fly.io, AWS, etc.) managed via:

```bash
pnpm seed:providers         # Seed provider list
pnpm link:providers         # Link repos to providers
```
