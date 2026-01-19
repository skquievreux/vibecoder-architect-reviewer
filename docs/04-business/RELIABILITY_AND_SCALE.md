# Reliability & Performance Architecture

This document outlines the strategy for ensuring high availability, fault tolerance, and optimal performance for the Vibecoder Architect Reviewer platform, addressing identified bottlenecks such as database connection exhaustion.

## 1. Database Reliability (The Connection Bottleneck)

### Problem
In serverless environments (like Vercel), each incoming request spawns a new lambda function. If `PrismaClient` is instantiated per request, this quickly exhausts the database connection limit (e.g., 100 connections), leading to `P1017` errors and `500` crashes.

### Implemented Solution (Development)
We have implemented a **Singleton Pattern** for `PrismaClient` in `lib/prisma.ts`. This ensures that in development (with hot-reloading), we reuse a single connection instance across reloads.

### Production Strategy
For production usage/deployment, we must implement:

1.  **Connection Pooling (PgBouncer):**
    *   Use a connection pooler like Supabase Transaction Mode (PgBouncer) running on port 6543.
    *   Set the `DATABASE_URL` to the pooler URL.
    *   Add `?pgbouncer=true` to the connection string.
    *   This allows thousands of heavy serverless functions to share a small number of physical database connections.

2.  **Graceful Degredation:**
    *   Implement circuit breakers for non-critical DB writes (e.g., logging/analytics). If the DB is busy, skip the log or write to a queue instead of crashing the user request.

## 2. API Performance & Caching

To further reduce load on the database and improve response times:

1.  **Request Memoization (Next.js):**
    *   Leverage Next.js `unstable_cache` or `fetch` caching for data that doesn't change often (e.g., Portfolio Strategy, Provider Lists).
    *   Tag cache keys (e.g., `['portfolio']`) and revalidate only on specific actions (`revalidateTag`).

2.  **KV / Redis Layer:**
    *   For high-frequency ephemeral data (like "current active users" or "job progress"), use Vercel KV or Upstash Redis instead of Postgres transactions.
    *   **Singleton Pattern for Redis:** Similar to Prisma, ensure a singleton Redis client.

## 3. Worker & Queue System

Long-running tasks (like "Analyze Repo" or "Ingest Portfolio") should **never** run in the main Vercel Function execution path (timeout risk).

1.  **Asynchronous Processing:**
    *   API routes should just *dispatch* a job and return `202 Accepted` immediately.
    *   Use **Inngest** or **Trigger.dev** as a serverless queue system.
    *   Example:
        *   User clicks "Scan Repo".
        *   API pushes job `scan_vulnerabilities` to queue.
        *   Worker (separate function) picks up job, runs it, and updates DB.
        *   UI polls for status or uses Server Sent Events (SSE).

## 4. Monitoring & Observability

We cannot fix what we cannot see.

1.  **Sentry:** Integrate Sentry for real-time error tracking to catch `500` errors immediately with stack traces.
2.  **Vercel Analytics:** Monitor "Function Execution Time" to identify slow API routes.
3.  **Prisma Metrics:** Enable Prisma Metrics in production to see connection pool usage and query duration histograms.

## 5. Security & Stability

1.  **Rate Limiting:** Protect API routes (especially AI/LLM routes) using `@upstash/ratelimit` to prevent abuse and cost explosions.
2.  **Input Validation:** Strict `zod` validation on ALL API inputs (already partially implemented) to prevent bad queries.

## Summary Checklist (Next Steps)

- [x] Implement Prisma Singleton (DONE)
- [ ] Configure PgBouncer in `DATABASE_URL` for Production
- [ ] Add Request Caching to `getPortfolio()`
- [x] Integrate Inngest for Background Jobs
- [ ] Set up Sentry for Error Monitoring

## Appendix: Case Study - The P1017 Incident (Dec 2025)

### What happened?
The application suffered a complete database outage during development/deployment cycles. The logs showed `PrismaClientInitializationError: P1017: Server has closed the connection`.

### Root Cause
We were instantiating `new PrismaClient()` directly in API routes and utility files. In a Serverless/Hot-Reload environment, this resulted in a **connection leak**. Every API call opened a new pool of connections until the database reached its `max_connections` limit and refused all further access, blocking both the production app and local development.

### Resolution
1.  **Code Fix:** Replaced all direct instantiations with a **Singleton Pattern** (`lib/prisma.ts`) that reuses a single instance across hot-reloads.
2.  **Recovery:** A hard **Cluster Restart** (via `fly machine restart`) was required to flush the "zombie" connections that persisted even after the code fix was deployed.

### Prevention Mandate
1.  **NEVER** instantiate `new PrismaClient()` outside of `lib/prisma.ts`.
2.  **ALWAYS** use the Connection Pooler URL (Port 6543) in Production environments.
3.  **MONITOR** active connections if 500 errors spike.
