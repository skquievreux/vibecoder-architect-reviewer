# Production Checklist & Troubleshooting

## 1. Database Connection Issues (500 Errors)
If you see `P1017` or "Server has closed the connection":
1.  **Restart Database:** Go to Supabase Dashboard -> Settings -> Database -> Restart. This clears all zombie connections.
2.  **Use Connection Pooling:** In Vercel Environment Variables, ensure `DATABASE_URL` uses port `6543` (Transaction Mode) and includes `?pgbouncer=true`.
    *   Example: `postgres://user:pass@host:6543/postgres?pgbouncer=true`
3.  **Direct URL:** Ensure `DIRECT_URL` uses port `5432` (Session Mode) for migrations.

## 2. Vercel Deployment
- Build Command: `npx prisma generate && next build`
- Install Command: `npm install`
- Output Directory: `.next`

## 3. Environment Variables
Ensure these are set in Vercel:
- `DATABASE_URL`: (Pooler URL, port 6543)
- `DIRECT_URL`: (Direct URL, port 5432)
- `NEXTAUTH_SECRET`: (Should be a long random string)
- `NEXTAUTH_URL`: (Your Vercel deployment URL)
