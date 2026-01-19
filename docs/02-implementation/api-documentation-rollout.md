---
title: "Implementation Plan: Universal API Documentation Rollout"
type: "implementation"
audience: "developer"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-31"
updated: "2025-12-31"
tags: ["api", "documentation", "rollout", "strategy"]
---

# Implementation Plan: Universal API Documentation Rollout

## Context
The Architecture Dashboard currently lists 70+ repositories, but only 1 displays API documentation. This is caused by missing `openapi.json` files and incomplete sync workflows in the projects.
We have identified that the `dashboard-sync.yml` workflow distributed across repositories does not currently transmit the `apiSpec` field correctly, and many repositories lack the spec file entirely.

## Goal
Achieve 100% API documentation coverage across the entire portfolio in the Developer Portal, enabling a centralized "Swagger UI" for the whole ecosystem.

## Strategy

### Phase 1: Visibility (Current Sprint)
- **Action:** Update Dashboard (`app/developer/page.tsx`) to list ALL repositories, regardless of API spec presence.
- **Outcome:** Dashboard shows ~71 cards. Those without docs show "No Documentation Available" or "Internal API".
- **Purpose:** Create transparency on the magnitude of the tech debt and track progress visually.

### Phase 2: Standardization (Next Sprints)
- **Action:** Update `dashboard-sync.yml` template in `.github` repository.
- **Requirement:** Ensure the template correctly reads and trasmits `openapi.json` (and `swagger.yaml`).
- **Standard:** Define standard location for specs: `/openapi.json` or `/public/openapi.json`.

### Phase 3: Rollout & Enforcement
- **Action:** Use "Ecosystem Guard" or mass-PR automation to update `.github/workflows/dashboard-sync.yml` in all 71 repositories.
- **Action:** Verify that keys (`DASHBOARD_API_KEY`) are present in repo secrets.
- **Action:** Fix the local `fetch-github-repos.ts` script to act as a reliable fallback/initialization tool.

### Phase 4: Generation Tooling
- **For Next.js projects:** Implement a standard generation script (e.g. using `swagger-jsdoc` or AI-assisted generation).
- **For NestJS projects:** Enforce `SwaggerModule` usage and build-time spec generation.
- **AI Fallback:** Use AI Agents to generate initial OpenAPI specs for legacy projects if no automatic generation is possible.

## Success Metrics
- **API Doc Coverage:** > 90% of active repositories.
- **Automated Sync Success Rate:** 100% of pushes trigger a successful dashboard update.
- **Developer Experience:** Developers can find any API spec centrally within the Dashboard.
