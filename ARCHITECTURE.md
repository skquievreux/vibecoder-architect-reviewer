# 🏗️ Architecture Documentation (v2.0.0)

This document describes the cloud architecture, deployment strategy, and technical decisions behind the **Vibecoder Architect Reviewer** platform as of Version 2.0.0.

## 1. High-Level Architecture

The platform operates on a **Hybrid Cloud Architecture**, leveraging the strengths of specific providers for different layers of the stack:

| Layer | Provider | Technology | Reason |
|-------|----------|------------|--------|
| **Frontend / Edge** | **Vercel** | Next.js 16 (App Router) | Global Edge Network, Instant Deployments, Serverless Functions |
| **Persistence** | **Fly.io** | PostgreSQL 16 Cluster | Full SQL Control, Low Latency, Persistent Storage, Cost Efficiency |
| **Authentication** | **GitHub** | OAuth 2.0 | Developer-centric Identity, Secure Access |
| **Orchestration** | **GitHub Actions** | CI/CD | Automation of tests and sync jobs |

### System Diagram

```mermaid
graph TD
    User[User Browser]
    
    subgraph Vercel ["Vercel Edge Network"]
        CDN[CDN / Static Assets]
        Edge[Edge Middleware (Auth)]
        Serverless[Serverless Functions (API)]
    end
    
    subgraph Fly ["Fly.io Infrastructure (fra)"]
        PG_Master[Postgres Primary]
        PG_Replica[Postgres Replica]
    end
    
    subgraph External
        GitHub[GitHub API]
        DNS[Cloudflare DNS]
    end

    User --> CDN
    User --> Edge
    Edge --> Serverless
    Serverless -->|Prisma Client| PG_Master
    Serverless -->|REST| GitHub
    CDN --> User
```

---

## 2. Database Strategy

We migrated from SQLite (local file) to **PostgreSQL on Fly.io** to support:
- **Persistence**: Data survives deployments (unlike SQLite on Serverless).
- **concurrency**: Multiple users/functions can write simultaneously.
- **Scalability**: Managed cluster with high availability potential.

### Connection
- **Production**: Vercel connects securely to Fly.io via SSL.
- **Development**: Developers connect to the same remote database (or local replica) defined in `.env.local`.

### Migrations (Prisma)
We use Prisma ORM. Schema changes are handled via:
1. `npx prisma migrate dev` (Local development)
2. `npx prisma migrate deploy` (Production deployment)
*Note: In v2.0.0 launch, we used `db push` to synchronize the fresh schema.*

---

## 3. Deployment Pipeline

### Vercel Integration
The deployment is fully automated via Vercel's GitHub Integration:
1. **Push to Main**: Triggers a production deployment.
2. **Pull Request**: Triggers a preview deployment with a unique URL.

### Build Process
The build command explicitly generates the Prisma Client to ensuring type safety in the serverless environment:

```json
"build": "npx prisma generate && next build"
```

### Environment Variables
Sensitive keys (Database URL, OAuth Secrets) are stored in **Vercel Project Settings** and **GitHub Secrets**, never in the repository.

---

## 4. Key Architectural Decisions (ADRs)

| ID | Title | Status | Impact |
|----|-------|--------|--------|
| **ADR-007** | **Hosting Strategy** | Accepted | Split frontend (Vercel) and state (Fly.io) for best-of-breed perf. |
| **ADR-001** | **Next.js 16** | Accepted | Adopting latest React Server Components architecture. |
| **ADR-002** | **Strict TypeScript** | Accepted | Ensuring robust type safety across the boundary. |

---

## 5. Security

- **Authentication**: Usage of NextAuth.js with GitHub Provider. No local password storage (except for admin fallback).
- **Callback URLs**: Strict whitelisting of `https://vibecode.runitfast.xyz/api/auth/callback/github`.
- **Database Access**: Protected via strong credentials. connection requires SSL.

---

*Last Updated: 2025-12-17 (Release v2.0.0)*
