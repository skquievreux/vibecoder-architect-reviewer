---
name: nextjs-prisma
description: Next.js 16 App Router + Prisma 5 skill for vibecoder-architect-reviewer. Covers API route patterns, DB access, auth guards, and dynamic rendering requirements.
---

# Next.js + Prisma Skill

## Project Analysis

- **Project**: vibecoder-architect-reviewer | **Type**: Next.js 16 / App Router / Prisma 5 / SQLite→PostgreSQL | **Compliance**: Governance OK

## Integration Plan

| Name                   | Type  | Reason                              | Action / Command                            |
| :--------------------- | :---- | :---------------------------------- | :------------------------------------------ |
| `react-best-practices` | Skill | Next.js 16 + React 19 detected      | `npx skills add vercel-labs/agent-skills`   |
| `shadcn-ui`            | Skill | Tailwind + component library in use | `npx skills add google-labs-code/shadcn-ui` |

## Rules for This Project

### 1. Prisma Client — always use the singleton

```typescript
import { prisma } from '@/lib/prisma'; // ✅
// Never: new PrismaClient()           // ❌ — exhausts connection pool in serverless
```

### 2. Every DB-accessing API route needs `force-dynamic`

```typescript
export const dynamic = 'force-dynamic'; // top of every route.ts that touches DB
```

### 3. Auth guard pattern (Server Component)

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/api/auth/signin');
  return <>{children}</>;
}
```

### 4. Standard API route shape

```typescript
// src/app/api/[resource]/route.ts
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await prisma.repository.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API_RESOURCE_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

### 5. Prisma CLI commands

```bash
pnpm exec prisma generate          # after schema changes
pnpm exec prisma db push           # dev (no migration file)
pnpm exec prisma migrate deploy    # prod (Fly.io PostgreSQL)
pnpm exec prisma db seed           # runs prisma/seed.ts
pnpm exec prisma studio            # GUI
```

## Infrastructure Note

Docker is present (`Dockerfile`, `docker-compose.yml`). PostgreSQL runs on Fly.io (primary + replica, `fra` region). Dev uses SQLite (`file:./dev.db`). Never run `prisma migrate dev` in prod — use `migrate deploy`.
