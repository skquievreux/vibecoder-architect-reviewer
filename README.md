This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Features

### 🧠 AI Architecture Reporting (v0.7.0)
- **Automated Analysis**: Generate actionable reports using Perplexity AI.
- **Knowledge Base (ADRs)**: Manage Architecture Decision Records and Policies.
- **AI Advisor**: Interactive chat for architectural guidance based on portfolio context.
- **Deployment Detection**: Automatically detect Vercel, Fly.io, and Docker deployments.
- **System Maintenance**:
    - Audit ecosystem versions (Node.js, TypeScript, Next.js).
    - Auto-fix configuration drifts.
    - View logs and audit reports directly in the UI.
- **Automated Task Management**:
    - AI-generated tasks for migrations and security.
    - Priority tracking with visual dashboard indicators.
- **Help System**:
    - Centralized documentation for all features.
    - Integrated "How-To" guides for maintenance and architecture decisions.
- **CI/CD Integration**: Automated linting and building workflows.

### 🚀 CI/CD & Automation
- **GitHub Actions**: Standardized pipeline for Linting, Building, and Verification.
- **Automated Versioning**: Builds automatically increment patch versions.
- **Health Checks**: Post-deployment verification scripts ensure system stability.

### 📊 Core Dashboard
- **Strategic Portfolio Intelligence**:
    - **Revenue Scoring**: Identify top revenue-generating candidates with estimated ARR.
    - **Consolidation Engine**: Detect redundant stacks and cluster similar projects for optimization.
    - **Business Canvas**: Interactive canvas for Value Prop, Customer Segments, and Cost Structure.
- **Repository Management**: Track 50+ repositories, their tech stacks, and health status.
- **Interface Visualization**: Map dependencies between services (Spotify, OpenAI, Supabase).
- **DNS & Hosting**: Manage Cloudflare DNS records and link them to Vercel/Fly.io deployments.
- **Cost Estimation**: Track estimated monthly infrastructure costs.

## API Documentation
The API is documented using OpenAPI 3.0. You can find the specification file at:
- [openapi.json](app/api/openapi.json)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
