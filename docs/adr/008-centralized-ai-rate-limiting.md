# ADR 008: Centralized AI Rate Limiting & Gateway

## Status
Accepted

## Date
2025-12-12

## Context
Our application relies heavily on external AI services (Perplexity, OpenAI) for features like portfolio enrichment, task generation, and architectural analysis. As the number of automated scripts (e.g., `enrich-portfolio.ts`) and API routes grew, we began experiencing frequent `429 Too Many Requests` errors.

These errors occurred because:
1.  Scripts and API routes instantiated their own isolated `OpenAI` clients.
2.  Requests were fired in parallel (`Promise.all`) without centralized concurrency control.
3.  There was no unified retry logic or exponential backoff strategy, leading to immediate failures upon hitting rate limits.

This instability prevented reliable bulk processing and degraded the user experience.

## Decision
We have decided to implement a **Centralized AI Gateway** pattern using a Singleton Client located in `lib/ai/core.ts`.

### Key Design Choices:
1.  **Singleton Instance**: All parts of the application must invoke AI operations through a single exported function `safeCompletion()` rather than instantiating `new OpenAI()` classes directly.
2.  **Global Request Serialize/Queue**: The client enforces strict sequential execution (or throttled concurrency) by chaining promises internally. A default delay (e.g., 2000ms) is enforced between requests to respect API provider limits.
3.  **Automatic Retry with Backoff**: The client catches `429` errors and automatically retries the request after waiting for an exponentially increasing duration (2s, 4s, 8s).
4.  **Robust Environment Loading**: The module internally handles the complexity of loading API keys (checking `.env` and `.env.local`), ensuring consistent behavior across both Next.js server runtime and standalone CLI scripts.

## Consequences

### Positive
*   **Reliability**: `429` errors are effectively eliminated or handled gracefully, allowing long-running batch jobs to complete without supervision.
*   **Maintainability**: API configuration (Base URL, Models, Keys) is centralized in one file. Changing providers (e.g. switching from Perplexity to another) only requires updating `lib/ai/core.ts`.
*   **Simplicity**: Consuming code (scripts/routes) is cleaner, as it no longer needs to handle auth or error loops.

### Negative
*   **Performance**: Sequential processing significantly increases the total time for bulk operations compared to parallel execution. (Mitigation: This is acceptable for background enrichment tasks where stability > speed).
*   **Global State**: The queue relies on in-memory state. In a serverless environment (e.g. Vercel deployment), this state is not shared across lambda instances.
    *   *Mitigation*: For the current local-first / single-user dashboard scope, this is sufficient. For scaled production, this would need to move to a persistent queue (Redis/BullMQ).

## Implementation
The implementation is located at `lib/ai/core.ts` and replaces direct library usage in `app/api/ai/*` and `scripts/*.ts`.
