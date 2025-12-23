---
title: "Ecosystem Bootstrapping Playbook: From Zero to Full Automation"
type: "implementation"
audience: "architect"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-23"
tags: ["ecosystem", "automation", "gh-actions", "setup"]
---

# Ecosystem Bootstrapping Playbook
**Objective:** Establish a centralized, self-updating dashboard for a distributed microservices ecosystem (60+ repositories) starting from zero.

## 🏗️ Phase 1: The Foundation (Dashboard & API)

Before collecting data, we need a "Brain" to store and process it.

### 1.1 Database Schema (Prisma)
Create a flexible schema that can ingest loose JSON data.
*   **Repository Model:** Stores `name`, `url`, `description`, `isPrivate`.
*   **Json Fields:** Use `packageJson`, `apiSpec`, `fileStructure` as flexible JSON columns to avoid rigid schema migrations for every new tool detected.
*   **Relations:** `Technology` (many-to-many), `Deployment` (one-to-many).

### 1.2 The Ingest API (`/api/system/ingest`)
Build a secure entryway for machines.
*   **Method:** `POST`
*   **Security:** Protect with `x-api-key` header (Master API Key). Do **NOT** use session-based auth (NextAuth) here.
*   **Logic:**
    1.  Receive Payload (Repo Info, package.json content, OpenAPI spec).
    2.  **Upsert** Repository (Create if new, Update if exists).
    3.  **Parse & Normalize:** Extract Technologies (e.g., "next" from dependencies) and Deployments (e.g., "vercel.json" detected).
    4.  **Save:** Store raw JSON for detailed analysis and normalized relations for the Radar.

### 1.3 Critical Configuration (The "307" Lesson)
*   **Middleware:** Ensure `middleware.ts` **excludes** the `/api/system` route from authentication checks.
    *   *Why?* GitHub Actions cannot perform "Login". They need direct API access. Failure to do this results in HTTP 307 Redirects.

---

## 🚜 Phase 2: The Collector (Pull Strategy)

We need a mechanism to fetch data even from repositories that are "sleeping" (no active development).

### 2.1 The Remote Harvester Workflow
Create a GitHub Action in the central dashboard repository (`.github/workflows/remote-repository-harvester.yml`).
*   **Trigger:** Scheduled (Cron: `0 4 * * *`) and `workflow_dispatch`.
*   **Tools:** Use `gh` CLI (pre-installed on runners).
*   **Process:**
    1.  `gh repo list` to get all 60+ repos.
    2.  Loop through each repo.
    3.  Fetching files: `package.json`, `openapi.json` via `gh api`.
    4.  **Sanitize:** Validate JSON (using `jq`) to prevent crashes on malformed files.
    5.  **Send:** `curl -X POST` to the Ingest API.
*   **Outcome:** Fills the database immediately with the current state of the world.

---

## ⚡ Phase 3: The Standard (Push Strategy)

We want real-time updates. When a developer pushes code, the dashboard should update instantly.

### 3.1 The Reusable Workflow Template
Create `workflow-templates/enhanced-dashboard-sync.yml`.
*   **Trigger:** `on: push` (main branch).
*   **Logic:** Similar to the Harvester, but usually simpler because it has direct file access (checkout).
*   **Capabilities:**
    *   Detect Frameworks (Next.js, React, FastAPI).
    *   Detect Spec files (`swagger.json`, `openapi.json`).
    *   Send payload to Dashboard API.

---

## 🚀 Phase 4: The Rollout (Mass Distribution)

The hardest part: How to get the workflow (Phase 3) into 60 existing repositories without manual work?

### 4.1 The Distribution Agent (Script)
Create a PowerShell/Bash script (`scripts/distribute-workflow-remote.ps1`) utilizing `gh` CLI.

**The Script Logic:**
1.  **Iterate:** Fetch list of all repositories.
2.  **inject Secrets:** Loop through repos and use `gh secret set` to inject:
    *   `DASHBOARD_URL`: Your production URL.
    *   `DASHBOARD_API_KEY`: The Master Key.
3.  **Inject Workflows:** Read local template files (`ci.yml`, `dashboard-sync.yml`) and use `gh api PUT /repos/.../contents/...` to create/update them in the target repos.

### 4.2 Execution
Run this script once via a "Rollout" Workflow (to leverage cloud bandwidth).
*   **Impact:** Instantly modernizes the entire fleet. Every repo now has CI/CD and Sync capability.

---

## 📊 Phase 5: Visualization & Value

Now that data is flowing:

### 5.1 The Dashboard
*   **Inventory:** A searchable table of all services.
*   **Tech Radar:** Visualize usage frequency of libraries (from `package.json` data).
*   **Portfolio:** Auto-generated summaries based on project descriptions.

### 5.2 API Documentation Hub
*   Render the stored `apiSpec` JSON using Swagger UI or Redoc within the dashboard.
*   **Result:** A centralized Developer Portal where you can browse the API of *any* microservice without cloning it.

---

## ✅ Success Criteria Checklist
| Component | Status | Verification |
|-----------|--------|--------------|
| **Middleware** | ✅ | `curl` to `/api/system/ingest` returns 401 (not 307) |
| **Harvester** | ✅ | GitHub Action runs green, logs show "60+ repos processed" |
| **Secrets** | ✅ | Every repo has `DASHBOARD_API_KEY` set |
| **Sync** | ✅ | Pushing to *any* repo triggers a "Dashboard Sync" action |
| **Display** | ✅ | Dashboard shows "Tech Overview" and API Docs |

---

*This document captures the architecture derived from the "VibeCoder" bootstrapping process on Dec 23, 2025.*
