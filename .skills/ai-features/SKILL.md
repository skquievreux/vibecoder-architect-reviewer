---
name: ai-features
description: AI integration skill for vibecoder-architect-reviewer. Covers OpenAI/Perplexity usage, task generation, architecture advice, business canvas analysis, and cost control.
---

# AI Features Skill

## Project Analysis

- **Project**: vibecoder-architect-reviewer | **Type**: OpenAI + Perplexity / Task Generation / Business Intelligence | **Compliance**: Governance OK

## Integration Plan

| Name                   | Type  | Reason                                                                | Action / Command                          |
| :--------------------- | :---- | :-------------------------------------------------------------------- | :---------------------------------------- |
| `react-best-practices` | Skill | AI results rendered in Next.js 16 UI                                  | `npx skills add vercel-labs/agent-skills` |
| `spider-mcp`           | MCP   | Docker present; web-augmented AI analysis benefits from live scraping | `npx add-mcp local/spider-mcp-server`     |

## Infrastructure Note

Docker is present. For AI-augmented repo analysis that requires live web data, the **Spider-DB-MCP stack** (Spider crawler + PostgreSQL) can feed enriched content into the Perplexity pipeline, replacing manual URL fetching.

## Core AI Modules

```
src/lib/ai/                        # All AI logic
src/lib/business-canvas-analyzer.ts # Commercial potential scoring
src/lib/consolidation-analyzer.ts   # Cross-repo consolidation advice
```

## Model Selection Rules

| Use Case               | Model                                          | Reason                        |
| :--------------------- | :--------------------------------------------- | :---------------------------- |
| Task generation (bulk) | `gpt-4o-mini`                                  | Cost-efficient, runs per-repo |
| Architecture advice    | `gpt-4o`                                       | User-triggered only           |
| Web-augmented analysis | Perplexity `llama-3.1-sonar-small-128k-online` | Live web context              |

## Task Generation Pattern

```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateTasksForRepo(repo: Repository): Promise<Task[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a senior software architect. Generate actionable tasks.' },
      { role: 'user', content: `Repo: ${repo.name}\nStack: ${repo.techStack}\nGenerate 3 tasks (security, maintenance, feature).` },
    ],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(completion.choices[0].message.content!).tasks;
}
```

## Perplexity Pattern

```typescript
const response = await fetch('https://api.perplexity.ai/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-sonar-small-128k-online',
    messages: [{ role: 'user', content: prompt }],
  }),
});
```

## Cost Control

- Cache AI responses in DB — skip re-generation if `aiGeneratedAt` < 7 days
- Never call AI in render path — always async background jobs
- Use `response_format: { type: 'json_object' }` to avoid parsing failures

## Required Environment Variables

```env
OPENAI_API_KEY="sk-..."
PERPLEXITY_API_KEY="pplx-..."
```
