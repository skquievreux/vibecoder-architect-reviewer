# API Performance & Optimization Analysis

## Overview
We have performed a static analysis of the codebase to identify all API calls and potential bottlenecks.
Here is the summary of the findings:

- **Total Fetch Calls Detected**: ~60 in the `app` directory.
- **Unique Endpoints**: 
    - `/api/repos` (and variations)
    - `/api/tasks`
    - `/api/dns`
    - `/api/notifications`
    - `/api/providers`
    - `/api/security`
    - `/api/portfolio`
    - `/api/ai/*`
    - External APIs (GitHub, OpenAI via backend proxies)

## Current Issues & Errors

### 1. Notification API Error
**Error**: `GET /api/notifications?limit=20` returned 500.
**Analysis**: The error originates in `app/api/notifications/route.ts`. It could be caused by:
- `getServerSession` failure (session invalid).
- Database connection failure.
- `userId` extraction issue.
**Fix Implemented**: We have added robust error handling and detailed logging to `app/api/notifications/route.ts`. The API will now log the specific cause of the failure and return a structured JSON error instead of a raw 500 crash where possible.

### 2. "hugofirebase" Error
**Error**: `hugofirebase:1 Failed to load resource`.
**Analysis**: The browser is attempting to load a resource literally named `hugofirebase`.
- This often happens if a variable containing a repository name (e.g. `repo.name`) is inadvertently used as a script source URL or link href without a protocol.
- Example: `<script src="{repo.name}">` -> `<script src="hugofirebase">`.
- This causes the browser to fetch `http://localhost:3000/hugofirebase`.
- If no route matches, it might hit a catch-all route or return 404/500, which the browser then tries to parse as a script, failing with "SyntaxError" or similar.
**Recommendation**: Check `app/layout.tsx` or `app/page.tsx` for any dynamic imports or script tags that use repository names.

## Optimization Strategy

### 1. Request Batching
Many components fetch data independently.
**Current**:
- `Dashboard` fetches `/api/repos`
- `NotificationCenter` fetches `/api/notifications`
- `Navbar` checks session.

**Recommendation**:
- Use **React Query** or **SWR** to deduplicate requests.
- Wrap the application in a `Providers` component that prefetches critical data.

### 2. Server Components (RSC)
Since this is a Next.js App Router project, moving data fetching to **Server Components** is the best optimization.
**Current**:
- `app/page.tsx` is `"use client"` and fetches `/api/repos` in `useEffect`.
**Optimization**:
- Change `app/page.tsx` to a Server Component.
- Fetch `prisma.repository.findMany()` directly in the component.
- Pass the data to a client component for interactivity (Search/Filter).
- **Benefit**: Eliminates the round-trip API call for the initial render. Drastically improves "LCP" (Largest Contentful Paint).

### 3. Preloading
The logs show "The resource <URL> was preloaded... but not used".
- This suggests aggressive preloading of routes or assets.
- Review `<Link>` components. Next.js preloads viewports by default.
- Minimize preloading for heavy routes or disable `prefetch={false}` on less critical links.

## Action Plan
1.  **Monitor**: Watch the logs for the specific error message from the new `notifications` route handler.
2.  **Refactor**: Convert `app/page.tsx` to a Server Component to fetch Repositories directly. This will remove the `/api/repos` call from the client entirely for the initial load.
3.  **Debug**: Inspect the "Network" tab for the initiator of the `hugofirebase` request.

