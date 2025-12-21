# Concept: Automated Portfolio Analysis Pipeline

## 🎯 Objective
To eliminate manual data entry and "guesswork" by strictly deriving business value and technical complexity from the actual codebase documentation (`README.md`, `package.json`, architecture docs) of all 72+ repositories.

## 🏗️ Architecture

The pipeline consists of three distinct stages: **Harvest**, **Analyze**, and **Persist**.

```mermaid
graph TD
    A[Database (72 Repos)] -->|Git URLs| B(Harvest Script)
    B -->|Fetch via API| C{Source Content}
    C -->|README.md| D[AI Analysis Engine]
    C -->|package.json| D
    D -->|Context| E(LLM: Product Analyst Persona)
    E -->|Generates| F[Portfolio MD Files]
    F -->|extract JSON| G[Prisma Database]
```

## 🛠️ Implementation Steps

### 1. Phase A: Harvester (`scripts/intelligence/harvest.ts`)
*   **Goal:** Retrieve the raw text content for every repository.
*   **Strategy:**
    *   Iterate through Prisma `Repository` table.
    *   Construct raw content URLs (e.g., `raw.githubusercontent.com/.../main/README.md`).
    *   Store content temporarily in `data/intelligence/raw/[repo_name].json`.
    *   *Constraint:* Must handle private repos using the `GITHUB_TOKEN`.

### 2. Phase B: Analysis Engine (`scripts/intelligence/analyze.ts`)
*   **Goal:** Transform raw text into structured business intelligence.
*   **System Prompt:** "You are a Senior Technical Product Manager. Analyze this codebase documentation. Identify the core user problem, the unique technical solution, and the theoretical revenue model."
*   **Output Format:** Standardized Markdown (`docs/portfolio-profiles/[repo_name].md`).

### 3. Phase C: Persistence Layer (`scripts/intelligence/sync-db.ts`)
*   **Goal:** Update the Dashboard UI.
*   **Action:** Parse the Frontmatter/JSON blocks from the generated Markdown files.
*   **Target:** Update `Repository.description` and `BusinessCanvas` table in Postgres.

## 📄 Output Artifact: The "Portfolio Profile"
For each repository, we will generate a file like `docs/portfolio-profiles/vibecoder.md`:

```markdown
---
slug: vibecoder-architect-reviewer
title: Vibecoder Architect
tagline: Automated Governance for Distributed Engineering Teams
tech_stack: [Next.js, Prisma, OpenAI]
---

## 💼 Business Case
**Problem:** Managing consistency across 70+ repositories is manually impossible.
**Solution:** Automated "Self-Healing" governance platform.

## 📊 Business Canvas
*   **Value Prop:** Reduces technical debt by 40% via automated ADR enforcement.
*   **Customer:** CTOs of Scale-Ups.
```

## ✅ Benefits
1.  **Accuracy:** Data reflects the actual code features, not assumptions.
2.  **Scalability:** Works for 72, 100, or 1000 repositories.
3.  **Ownership:** You own the generated Markdown files as permanent assets.
