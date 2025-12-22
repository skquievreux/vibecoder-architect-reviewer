---
title: "Vibecoder Architect Reviewer - Project Overview"
type: "reference"
audience: "all"
status: "approved"
priority: "high"
version: "2.5.1"
created: "2025-12-22"
updated: "2025-12-22"
reviewers: ["@opencode"]
related: ["./docs/01-architecture/", "./docs/02-implementation/", "./docs/03-operations/", "./docs/04-business/", "./docs/05-reference/"]
tags: ["overview", "portfolio", "architecture", "ai"]
---

# 🏗️ Vibecoder Architect Reviewer

> Eine umfassende Portfolio-Management- und Architektur-Review-Plattform für GitHub-Repositories mit AI-gestützter Analyse, Business Intelligence und automatisiertem Deployment-Management.

**Version:** 2.5.1 🚀  
**Status:** Live in Production  
**Deployment:** [Vercel](https://vibecode.runitfast.xyz) + [Fly.io](https://fly.io)  
**License:** MIT

---

## 📋 Inhaltsverzeichnis

- [📚 Documentation Guide](./DOCS.md) - Complete documentation index
- [🎯 Overview](#overview) - Project goals and capabilities
- [✨ Features](#features) - Detailed feature list
- [🚀 Quick Start](#quick-start) - Getting started instructions
- [🛠️ Tech Stack](#tech-stack) - Technology overview
- [📊 Documentation Structure](#documentation-structure) - Docs organization
- [📞 Support](#support) - Help and support information

---

## 🎯 Overview

Vibecoder Architect Reviewer ist eine leistungsstarke Plattform zur Verwaltung und Analyse Ihrer GitHub-Repositories. Die Anwendung kombiniert automatische Code-Analyse, Business Intelligence und AI-gestützte Empfehlungen, um Ihnen einen vollständigen Überblick über Ihr Software-Portfolio zu geben.

### Hauptziele

- **📊 Portfolio-Übersicht**: Zentralisierte Ansicht aller Repositories mit Technologie-Stack und Deployment-Status
- **💼 Business Intelligence**: Bewertung des kommerziellen Potenzials jedes Projekts
- **🤖 AI-Unterstützung**: Automatische Task-Generierung und Architektur-Beratung
- **🚀 Deployment-Management**: Verwaltung von Deployments und Custom Domains
- **📝 Dokumentation**: Architecture Decision Records (ADRs) und automatische Reports

---

## ✨ Features

### 🔍 Repository-Analyse
- Automatische Technologie-Erkennung (Sprachen, Frameworks, Datenbanken)
- Interface-Detection (REST APIs, GraphQL, Cloud-Services)
- **Private Repository Support** - Vollständiger Zugriff auf 63 Repositories (15 öffentlich, 48 privat)

### 💼 Business Canvas Management
- Value Proposition Analysis
- Customer Segmentation mit Pain Points
- Revenue Streams mit ARR-Schätzungen
- Cost Structure-Tracking und Optimierung

### 🚀 Deployment-Verwaltung
- Multi-Provider Support (Vercel, Netlify, Fly.io, AWS, etc.)
- Cloudflare DNS-Management mit automatischer CNAME-Erstellung
- Link Health Monitoring mit Latency-Messung

### 🤖 AI-Features
- Automatische Task-Generierung (Security, Maintenance, Features)
- Architektur-Beratung mit Best Practices
- Repository-Beschreibungen (SEO-optimiert)

### 📝 Architecture Decision Records
- 13 vordefinierte ADRs (Next.js 16, TypeScript Strict Mode, etc.)
- Status-Tracking (Proposed, Accepted, Deprecated)
- Tag-basierte Kategorisierung

### 📊 Reporting & Analytics
- Portfolio-Reports mit Technologie-Verteilung
- AI-generierte Projekt-Übersichten
- Cost-Übersicht und Health-Scores

---

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** >= 20.9.0
- **Python** 3.8+
- **Git**
- **GitHub Account** mit Personal Access Token

### Installation

#### Option 1: Automatisches Setup (Empfohlen)

```bash
# Repository klonen
git clone https://github.com/yourusername/vibecoder-architect-reviewer.git
cd vibecoder-architect-reviewer

# Automatisches Setup ausführen
node quick-setup.js
```

#### Option 2: Manuelles Setup

```bash
# 1. Dependencies installieren
npm install
pip install -r analysis/requirements.txt

# 2. Environment konfigurieren
cp .env.example .env.local
# Bearbeiten Sie .env.local und fügen Sie Ihre Credentials hinzu

# 3. Datenbank initialisieren
npx prisma generate
npx prisma db push

# 4. Repositories analysieren
python analysis/analyzer.py

# 5. Datenbank befüllen
npx prisma db seed
node scripts/import-portfolio.js
npx ts-node scripts/seed-adrs.ts
node scripts/seed-providers.js
```

### Konfiguration

#### Erforderliche Environment-Variablen

```env
# Datenbank
DATABASE_URL="file:./dev.db"

# GitHub (Erforderlich)
GITHUB_TOKEN="ghp_your_token_here"
GITHUB_OWNER="your-github-username"

# Authentication (Erforderlich)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AI (Optional, aber empfohlen)
PERPLEXITY_API_KEY="pplx_your_key"
OPENAI_API_KEY="sk_your_key"

# Cloudflare (Optional, für DNS-Management)
CLOUDFLARE_API_TOKEN="your_token"
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.0 (App Router)
- **UI Library**: React 19.2.3 + Tailwind CSS 3.4.18
- **Components**: Tremor React + Lucide Icons
- **Visualisierung**: ReactFlow

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **API**: Next.js API Routes (Serverless)
- **Datenbank**: PostgreSQL 16 (Managed Cluster on Fly.io)
- **ORM**: Prisma 5.22.0
- **Auth**: NextAuth.js (GitHub OAuth)

### ☁️ Cloud Architecture (Hybrid)
- **Frontend/Edge**: Vercel (Global Edge Network)
- **Persistence**: Fly.io (Postgres Primary+Replica Cluster in `fra` region)
- **Orchestration**: GitHub Actions & Vercel CI/CD

### Externe Services
- GitHub API, Cloudflare API
- Perplexity/OpenAI (AI-Features)
- Supabase (Optional)

---

## 📊 Documentation Structure

This project follows a comprehensive Documentation Governance Framework with standardized structure:

### 📁 Directory Organization
```
docs/
├── 01-architecture/      # ADRs, design decisions
├── 02-implementation/   # Setup, deployment, configuration  
├── 03-operations/        # Runbooks, monitoring, maintenance
├── 04-business/         # Product docs, portfolio, strategy
├── 05-reference/        # API docs, CLI reference, glossary
├── _templates/          # Documentation templates
└── _assets/            # Images, diagrams, screenshots
```

### 🔗 Documentation Index
For complete documentation, see: [📚 Documentation Guide](./DOCS.md)

### 📋 Governance Standards
- **Metadata Frontmatter**: All docs include standardized YAML frontmatter
- **Version Management**: Automated via Semantic Release
- **Quality Assurance**: Automated validation and peer review
- **Template Usage**: Standardized templates for consistency

---

## 📞 Support

### Hilfe benötigt?

1. **📚 Documentation**: [Complete Documentation Guide](./DOCS.md)
2. **🔧 Troubleshooting**: [Troubleshooting Guide](./docs/03-operations/troubleshooting.md)
3. **⚙️ Setup-Guide**: [Setup Documentation](./docs/02-implementation/setup-guide.md)
4. **🏗️ Architecture**: [Architecture Decisions](./docs/01-architecture/)

### Nützliche Befehle

```bash
# Status-Check
node check-env.js          # Environment validieren
node check-db-counts.js    # Datenbank-Statistiken
node check-logs.js         # Logs anzeigen

# Sync
python analysis/analyzer.py  # Repositories analysieren
npx prisma db seed       # Datenbank befüllen

# Maintenance
npx prisma studio        # Datenbank-GUI
npm run build            # Production Build
```

---

## 🔄 Version Management

This project uses **Semantic Release** for automated version management:

### 🤖 Semantic Release Workflow
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`
- **Automated Versioning**: Bot calculates version from commits
- **Git Tags as Source of Truth**: Never manually edit `package.json` version
- **Automated Changelog**: Generated in `CHANGELOG.md`

### 📋 Build Information
Version information is logged during build and displayed in UI following governance standards.

### 🚨 Important Rules
- ❌ **NEVER** manually edit `package.json` version
- ❌ **NEVER** manually create Git tags
- ❌ **NEVER** manually edit `CHANGELOG.md`
- ✅ **ALWAYS** use conventional commit messages
- ✅ **ALWAYS** let Semantic Release Bot handle versioning

---

**Version:** 2.5.1  
**Last Updated:** 2025-12-22  
**Framework:** Documentation Governance Framework v1.0.0  
**Compliance Score:** 9/10 ✅

---

*Following [Documentation Governance Framework v1.0.0](./docs/_templates/GOVERNANCE_FRAMEWORK.md)*