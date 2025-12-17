# 🏗️ Vibecoder Architect Reviewer

**Version:** 2.0.0 🚀  
**Status:** Live in Production  
**Deployment:** [Vercel](https://vibecode.runitfast.xyz) + [Fly.io](https://fly.io)  
**License:** MIT

> Eine umfassende Portfolio-Management- und Architektur-Review-Plattform für GitHub-Repositories mit AI-gestützter Analyse, Business Intelligence und automatisiertem Deployment-Management.

---

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Technologie-Stack](#-technologie-stack)
- [Dokumentation](#-dokumentation)
- [Projekt-Status](#-projekt-status)
- [Support](#-support)

---

## 🎯 Überblick

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

### 🚀 Deployment & DNS
- Multi-Provider Support (Vercel, Netlify, Fly.io, AWS, etc.)
- Cloudflare DNS-Management mit automatischer CNAME-Erstellung
- Link Health Monitoring mit Latency-Messung

### 🤖 AI-Features
- Automatische Task-Generierung (Security, Maintenance, Features)
- Architektur-Beratung mit Best Practices
- Repository-Beschreibungen (SEO-optimiert)

### 📝 Architecture Decision Records
- 7 vordefinierte ADRs (Next.js 16, TypeScript Strict Mode, etc.)
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

**GitHub Token erstellen:**
1. https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Scopes: `repo` + `read:org`
4. Token in `.env.local` einfügen

### Development Server starten

```bash
npm run dev
```

Öffnen Sie http://localhost:3000 im Browser.

### Erste Schritte

1. **Environment validieren**: `node check-env.js`
2. **Repositories synchronisieren**: Klick auf "Sync" im Dashboard
3. **Business Canvas bearbeiten**: Repository öffnen → "Edit Canvas"
4. **Tasks generieren**: Klick auf "Generate Tasks"

---

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: Next.js 16.0.5 (App Router)
- **UI**: React 18.3.1 + Tailwind CSS 3.4.18
- **Components**: Tremor React + Lucide Icons
- **Visualisierung**: ReactFlow

### Backend
- **Runtime**: Node.js 20+ LTS
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

### Analyse-Tools
- Python 3.8+ (Repository-Analyzer)
- python-dotenv, requests

---

## 📚 Dokumentation

### Haupt-Dokumentation
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Vollständige Funktions- und API-Dokumentation (10.000+ Wörter)
- **[SETUP.md](./SETUP.md)** - Detaillierte Setup-Anleitung (Deutsch)
- **[RELEASE_v0.11.1.md](./RELEASE_v0.11.1.md)** - Release Notes

### Spezifische Guides
- **[analysis/README.md](./analysis/README.md)** - GitHub Analyzer Dokumentation
- **[.env.example](./.env.example)** - Environment-Variablen Template

### API-Dokumentation

**Wichtigste Endpoints:**
- `GET /api/repos/[name]` - Repository-Details
- `POST /api/ai/tasks` - Task-Generierung
- `POST /api/dns` - DNS-Record erstellen
- `PATCH /api/repos/[name]/canvas` - Business Canvas aktualisieren

Vollständige API-Referenz: [DOCUMENTATION.md](./DOCUMENTATION.md#api-dokumentation)

---

## 📊 Projekt-Status

### Statistiken (v0.11.1)

- **Repositories**: 63 (15 öffentlich, 48 privat)
- **Technologies**: 284 erkannt
- **Business Canvases**: 26
- **ADRs**: 7
- **AI Reports**: 3
- **Providers**: 16

### Build-Status

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Deployment](https://img.shields.io/badge/deployment-live-success)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 📞 Support

### Hilfe benötigt?

1. **Dokumentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
2. **Troubleshooting**: [DOCUMENTATION.md#troubleshooting](./DOCUMENTATION.md#troubleshooting)
3. **Setup-Guide**: [SETUP.md](./SETUP.md)

### Nützliche Befehle

```bash
# Status-Check
node check-env.js          # Environment validieren
node check-db-counts.js    # Datenbank-Statistiken
node check-logs.js         # Logs anzeigen

# Sync
python analysis/analyzer.py  # Repositories analysieren
npx prisma db seed           # Datenbank befüllen

# Maintenance
npx prisma studio           # Datenbank-GUI
npm run build              # Production Build
```

---

## 🔄 Was ist neu in v0.11.1?

### 🐛 Bug Fixes
- ✅ Sync-Fehler behoben (`analyzer.py` erstellt)
- ✅ Private Repository Support (48 private Repos hinzugefügt)
- ✅ React Hooks-Fehler behoben
- ✅ Environment Variable Loading in Python

### ✨ Neue Features
- ✅ Umfassende `.env.example` mit allen Variablen
- ✅ `check-env.js` - Environment-Validator
- ✅ `quick-setup.js` - Automatisches Setup
- ✅ Vollständige Dokumentation (DOCUMENTATION.md)

### 📦 Daten-Wiederherstellung
- ✅ Business Canvases: 26 importiert
- ✅ ADRs: 7 wiederhergestellt
- ✅ AI Reports: 3 wiederhergestellt
- ✅ Providers: 16 wiederhergestellt

Vollständige Release Notes: [RELEASE_v0.11.1.md](./RELEASE_v0.11.1.md)

---

## 📄 License

MIT License - siehe [LICENSE](./LICENSE)

---

**Made with ❤️ by the Vibecoder Team**

[⬆ Back to top](#-vibecoder-architect-reviewer)
