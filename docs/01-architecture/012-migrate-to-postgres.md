# ADR-012: Migration to PostgreSQL on Fly.io

**Status**: PROPOSED
**Date**: 2025-12-17
**Author**: Antigravity AI
**Related to**: ADR-009 (Local Database Strategy)

## Context

The application currently uses SQLite (`dev.db`). This has served well for local development but presents two major blockers:
1.  **Deployment**: Target platform Vercel does not support persistent file storage (SQLite files are lost on restart).
2.  **Scalability**: SQLite is limited for multi-user concurrency and lacks advanced database features.
3.  **Cost**: The user wants to consolidate multiple existing Supabase projects into a single, cost-effective managed solution.

## Decision

We will migrate the database layer from SQLite to **PostgreSQL**.
To optimize costs ($55/mo -> ~$10/mo), we will host the PostgreSQL cluster on **Fly.io** instead of using robust but expensive managed providers for every single project.

### Architecture
- **App Hosting**: Vercel (Next.js)
- **Database Hosting**: Fly.io (Managed Postgres Cluster)
- **Connectivity**: Public IPv4 (for Vercel access) or Proxy
- **ORM**: Prisma (updated provider settings)

## Consequences

### Positive
- **Deployable**: Application can now be deployed to Vercel.
- **Cost Savings**: Significant reduction by using Fly.io shared cluster.
- **Consolidation**: Allows moving other projects (`projectrecorder`, `wind-inspector`, etc.) to the same cluster later.

### Negative
- **Complexity**: Setup is more complex than SQLite (requires network config, credentials).
- **Network Latency**: Database is no longer on the "same disk" as the app.
- **Management**: Fly.io Postgres requires more manual maintenance (backups, upgrades) compared to Supabase.

## Implementation Plan

1.  Update Prisma Schema.
2.  Create Fly.io resource docs.
3.  Set up Vercel environment variables.
