# Rate Limit Management Strategy

## Problem Analysis
The application was frequently hitting `429 Too Many Requests` errors from the Perplexity/OpenAI APIs. This occurred because multiple scripts and API routes were:
1. Calling the API directly without coordination.
2. Using simple `Promise.all` loops without concurrency control.
3. Not handling `429` retry logic (exponential backoff).

## Solution Architecture: Centralized AI Gateway

We have implemented a **Centralized AI Client** in `lib/ai/core.ts`.

### Key Features
1.  **Global Rate Limiting**: All requests are routed through a central queue/chain mechanism.
    *   Sequential execution logic is enforced to strictly respect rate limits.
    *   Explicit delay (default: 2000ms) between requests.
2.  **Automatic Retries**: If a `429` error occurs, the client automatically waits (exponential backoff: 4s, 8s, 16s) and retries up to 3 times.
3.  **Singleton Pattern**: The client initialization is handled once, correctly loading environment variables from `.env.local` even in script contexts.

### Implementation Status
*   **`lib/ai/core.ts`**: The core module is created.
*   **`app/api/ai/describe/route.ts`**: Refactored to use `safeCompletion`.
*   **`scripts/enrich-portfolio.ts`**: Refactored to use `safeCompletion`.

### Future Improvements
1.  **Caching Layer**: Implement a database or Redis cache to store AI responses for identical prompts (hash-based) to save costs and time.
2.  **Background Jobs**: Move enrichment tasks to a persistent queue (e.g. BullMQ) completely decoupled from the user request cycle.
3.  **Smart Batching**: Combine multiple small prompts into one larger prompt where possible to reduce request count.

## Usage Guide
When adding new AI features, **DO NOT** use `new OpenAI()`. Instead:

```typescript
import { safeCompletion } from '@/lib/ai/core';

const result = await safeCompletion({
    model: "sonar-pro",
    messages: [...]
});
```
