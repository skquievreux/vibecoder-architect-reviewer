# Performance Optimization Strategy

Derived from AI Architect Advisor recommendations and tailored for VibeCoder Dashboard (Next.js 16 App Router).

## 1. Measurement & Monitoring
**Goal**: Stop guessing, start measuring.
-   [ ] **Lighthouse CI**: Integrate into CI pipeline to block regressions in LCP/CLS.
-   [ ] **Bundle Analysis**: Install `@next/bundle-analyzer` to detect large dependencies.
-   [ ] **Vercel Analytics** (if applicable): Enable Web Vitals tracking.

## 2. Rendering Strategy (App Router)
**Goal**: Minimize Client-Side JavaScript.
-   **Server Components by Default**: Ensure all components are Server Components unless `useState`/`useEffect` is strictly needed.
-   **Suspense Boundaries**: Wrap slow data-fetching components (like Portfolio Graphs) in `<Suspense>` to unblock the main UI.
-   **Partial Pre-Rendering (PPR)**: Evaluate enabling PPR in `next.config.ts` (experimental in Next 15/16) for hybrid static/dynamic shell.

## 3. Image Optimization
**Goal**: Prevent Layout Shifts (CLS) and reduce bandwidth.
-   **Sharp**: Ensure `sharp` is installed for production image optimization (`npm i sharp`).
-   **Sizes Attribute**: Audit all `next/image` usage to ensure `sizes` prop is accurate (don't load desktop images on mobile).
-   **AVIF/WebP**: `next/image` automatically handles this, but verify `next.config.ts` allows it.

## 4. Code Splitting & Lazy Loading
**Goal**: Reduce Initial JS Bundle.
-   **Heavy Charts**: Use `next/dynamic` for Tremor/Recharts components that are not above-the-fold.
    ```typescript
    const DynamicChart = dynamic(() => import('./HeavyChart'), { loading: () => <Skeleton /> })
    ```
-   **Modals**: Lazy load modal contents.

## 5. Data Fetching
**Goal**: Efficient Server-Side Data Access.
-   **Parallel Fetching**: Use `Promise.all` in Server Components instead of awaiting sequentially.
-   **Request Memoization**: Next.js automatically memoizes `fetch`. Ensure database calls are also cached or optimized if called multiple times proper request.
-   **Prisma Singleton**: (Already Implemented) Prevents connection overhead.

## 6. Action Plan
1.  **Immediate**: Install `@next/bundle-analyzer` and check bundle size.
2.  **Immediate**: Audit `app/portfolio` for blocking fetches and wrap in Suspense.
3.  **Configuration**: Update `next.config.ts` to strictly type headers and image domains.
