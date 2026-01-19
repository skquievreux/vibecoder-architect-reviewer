---
title: "Vibecoder Architect Reviewer - Vollständige Dokumentation"
type: "reference"
audience: "developer"
status: "approved"
priority: "high"
version: "0.11.1"
created: "2025-12-11"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["DOCUMENTATION_RULES.md"]
tags: ["documentation", "reference", "manual"]
---

# 📚 Vibecoder Architect Reviewer - Vollständige Dokumentation

**Version:** 0.11.1  
**Letzte Aktualisierung:** 2025-12-11

## 🎯 Überblick

Vibecoder Architect Reviewer ist eine umfassende Portfolio-Management- und Architektur-Review-Plattform für GitHub-Repositories. Die Anwendung analysiert automatisch Ihre Repositories, erkennt verwendete Technologien, verwaltet Deployments und bietet Business-Intelligence-Features zur Bewertung des kommerziellen Potenzials Ihrer Projekte.

### Hauptfunktionen
- **Repository-Analyse**: Automatische Erkennung von Sprachen, Frameworks und Dependencies.
- **Business Canvas Management**: Strategische Bewertung des kommerziellen Potenzials.
- **Deployment-Verwaltung**: Unterstützung für Vercel, Fly.io, Cloudflare DNS etc.
- **Architecture Decision Records (ADRs)**: Systematische Dokumentation von Architekturentscheidungen.
- **AI-gestützte Features**: Task-Generierung, Architektur-Beratung und Beschreibungen.

## 🏗️ Architektur

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 18, Tailwind CSS, Tremor UI.
- **Backend**: Node.js 20+, Next.js API Routes, Prisma ORM.
- **Datenbank**: SQLite (dev), PostgreSQL (prod).
- **Analyse**: Python 3.8+ Analyzer Skript.

## 🎨 Funktionen im Detail

### 1. Repository-Analyse
Der Python-Analyzer (`analysis/analyzer.py`) erkennt Sprachen, Frameworks und Interfaces automatisch via GitHub API.

### 2. Business Canvas
Ermöglicht die strategische Planung von Value Propositions, Customer Segments und Revenue Streams pro Repository.

### 3. Deployment & DNS
Verknüpfung von Repositories mit Deployments und automatisches DNS-Management via Cloudflare API.

### 4. ADR Management
Systematische Erfassung von Entscheidungen (z.B. ADR-001 bis ADR-007 sind vorkonfiguriert).

### 5. AI Features
Nutzung von Perplexity/OpenAI für intelligente Task-Generierung und Architektur-Analysen.

## 🔌 API-Dokumentation
Detaillierte Endpunkte für Repositories, DNS, Tasks und AI-Features sind im Code dokumentiert.

## 🗄️ Datenbank-Schema
Zentrale Modelle: `Repository`, `BusinessCanvas`, `ArchitectureDecision`, `Deployment`, `Provider`.

---

*Hinweis: Dies ist eine Zusammenfassung der vollständigen Dokumentation. Für Details siehe die spezifischen Guides in `docs/`.*
