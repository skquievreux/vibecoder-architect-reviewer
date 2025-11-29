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

### 🧠 AI Architecture Reporting (New in v0.2.0)
- **Automated Analysis**: Generates comprehensive architecture reports using Perplexity AI.
- **Actionable Insights**: Identifies security risks, outdated dependencies, and strategic recommendations.
- **Interactive Reports**: Reports contain clickable links to specific repositories, logs, and settings within the dashboard.
- **History**: Access past reports to track improvements over time.

### 🚀 CI/CD & Automation
- **GitHub Actions**: Standardized pipeline for Linting, Building, and Verification.
- **Automated Versioning**: Builds automatically increment patch versions.
- **Health Checks**: Post-deployment verification scripts ensure system stability.

### 📊 Core Dashboard
- **Repository Management**: Track 50+ repositories, their tech stacks, and health status.
- **Interface Visualization**: Map dependencies between services (Spotify, OpenAI, Supabase).
- **DNS & Hosting**: Manage Cloudflare DNS records and link them to Vercel/Fly.io deployments.
- **Cost Estimation**: Track estimated monthly infrastructure costs.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
