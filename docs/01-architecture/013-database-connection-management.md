# ADR-013: Database Connection Management Strategy

Date: 2025-12-17
Status: Accepted

## Context

The "Vibe-Coder" Architect Reviewer application is built on Next.js and deployed in a serverless environment (Vercel) backed by a PostgreSQL database (Fly.io/Supabase).

During development and high-load testing, the application experienced severe database instability, specifically `PrismaClientInitializationError: P1017: Server has closed the connection`.

Investigation revealed that the root cause was **Connection Exhaustion**. The application code was instantiating `new PrismaClient()` directly within various API routes and utility libraries. In a serverless environment (and during local hot-reloading), each invocation or file change created a new, separate connection pool. With a default pool size of 10+ connections per client, the database's `max_connections` limit (typically 100) was rapidly reached, creating "zombie" connections and locking out the application.

## Decision

We have decided to enforce a strict **Singleton Pattern** for database access and mandate **Connection Pooling** for production.

### 1. Singleton Prisma Instance
We will use a central utility module (`lib/prisma.ts`) to manage the `PrismaClient` lifecycle.
- In **development**, this module attaches the client instance to the `globalThis` object to persist the connection across hot-reloads.
- In **production**, it ensures only one instance is created per container/lambda execution context.

**Constraint:** Developers MUST import `prisma` from `@/lib/prisma` and MUST NOT instantiate `new PrismaClient()` in feature code.

### 2. Connection Pooling in Production
For production environments, the application MUST connect to the database via a transaction pooler (e.g., PgBouncer, Supavisor).
- The `DATABASE_URL` environment variable must point to the pooler port (typically 6543).
- The connection string parameters must include `?pgbouncer=true` to disable prepared statements (which are incompatible with transaction mode).

## Consequences

### Positive
*   **Stability:** Eliminates `P1017` errors and prevents the application from DDoS-ing its own database.
*   **Scalability:** Allows the serverless application to scale to thousands of function invocations while maintaining a constant, low number of physical database connections.
*   **Developer Experience:** Local development no longer crashes due to hot-reload connection accumulation.

### Negative
*   **Code Discipline:** Requires strict adherence to the import pattern. Direct instantiation requests in Pull Reviews must be rejected.
*   **Infrastructure Complexity:** Requires ensuring the database provider offers a connection pooler or deploying a separate PgBouncer instance.

## Related Documents
*   `docs/concepts/RELIABILITY_AND_SCALE.md` - Technical implementation details.
