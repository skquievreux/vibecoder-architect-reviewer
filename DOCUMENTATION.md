# 📚 Vibecoder Architect Reviewer - Vollständige Dokumentation

**Version:** 0.11.1  
**Letzte Aktualisierung:** 2025-12-11

---

## 📖 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Architektur](#architektur)
3. [Funktionen im Detail](#funktionen-im-detail)
4. [API-Dokumentation](#api-dokumentation)
5. [Datenbank-Schema](#datenbank-schema)
6. [Workflows](#workflows)
7. [Entwickler-Guide](#entwickler-guide)
8. [Deployment](#deployment)
9. [Wartung & Monitoring](#wartung--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Überblick

### Was ist Vibecoder Architect Reviewer?

Vibecoder Architect Reviewer ist eine umfassende Portfolio-Management- und Architektur-Review-Plattform für GitHub-Repositories. Die Anwendung analysiert automatisch Ihre Repositories, erkennt verwendete Technologien, verwaltet Deployments und bietet Business-Intelligence-Features zur Bewertung des kommerziellen Potenzials Ihrer Projekte.

### Hauptfunktionen

#### 1. **Repository-Analyse**
- Automatische Erkennung von Programmiersprachen
- Framework- und Technologie-Detection
- Dependency-Analyse
- Interface-Erkennung (APIs, Datenbanken, Cloud-Services)

#### 2. **Business Canvas Management**
- Value Proposition-Analyse
- Customer Segment-Identifikation
- Revenue Stream-Planung
- Cost Structure-Tracking
- Monetarisierungspotenzial-Bewertung

#### 3. **Deployment-Verwaltung**
- Multi-Provider-Support (Vercel, Fly.io, Supabase, etc.)
- DNS-Management über Cloudflare
- Custom Domain-Konfiguration
- Link Health Monitoring

#### 4. **Architecture Decision Records (ADRs)**
- Dokumentation von Architekturentscheidungen
- Status-Tracking (Proposed, Accepted, Deprecated)
- Tag-basierte Kategorisierung
- Konsequenz-Analyse

#### 5. **AI-gestützte Features**
- Automatische Task-Generierung
- Architektur-Beratung
- Repository-Beschreibungen
- Business-Analyse

#### 6. **Task-Management**
- Automatische Aufgabenerstellung
- Prioritäts-basierte Organisation
- Status-Tracking
- Type-Kategorisierung (Security, Maintenance, Feature)

---

## 🏗️ Architektur

### Tech Stack

#### Frontend
- **Framework**: Next.js 16.0.5 (App Router)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.18
- **Components**: Tremor React (Charts & Dashboards)
- **Icons**: Lucide React
- **Visualisierung**: ReactFlow (für Architektur-Diagramme)

#### Backend
- **Runtime**: Node.js 20+ (LTS)
- **API**: Next.js API Routes
- **Datenbank**: SQLite (dev), PostgreSQL (production-ready)
- **ORM**: Prisma 5.22.0
- **Authentication**: NextAuth.js 4.24.13

#### Externe Services
- **GitHub API**: Repository-Daten
- **Cloudflare API**: DNS-Management
- **Perplexity/OpenAI**: AI-Features
- **Supabase**: Optional für erweiterte Features

#### Analyse-Tools
- **Python 3.8+**: Repository-Analyzer
- **python-dotenv**: Environment-Management
- **requests**: HTTP-Client für GitHub API

### Projektstruktur

```
vibecoder-architect-reviewer/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai/                   # AI-Endpoints
│   │   │   ├── architect/        # Architektur-Beratung
│   │   │   ├── describe/         # Repository-Beschreibungen
│   │   │   ├── generate/         # Content-Generierung
│   │   │   └── tasks/            # Task-Generierung
│   │   ├── dns/                  # DNS-Management
│   │   ├── github/               # GitHub-Integration
│   │   ├── providers/            # Provider-Management
│   │   ├── repos/                # Repository-Endpoints
│   │   ├── system/               # System-Operationen
│   │   └── tasks/                # Task-Management
│   ├── architect/                # Architektur-Dashboard
│   ├── portfolio/                # Portfolio-Ansicht
│   ├── repo/[name]/              # Repository-Details
│   ├── report/                   # Reporting
│   └── layout.tsx                # Root Layout
├── analysis/                     # Python-Analyzer
│   ├── analyzer.py               # Haupt-Analyseskript
│   ├── requirements.txt          # Python-Dependencies
│   └── README.md                 # Analyzer-Docs
├── prisma/                       # Datenbank
│   ├── schema.prisma             # Datenbankschema
│   └── seed.ts                   # Seed-Daten
├── scripts/                      # Utility-Skripte
│   ├── seed-*.js                 # Verschiedene Seeder
│   ├── import-portfolio.js       # Portfolio-Import
│   ├── restore-from-backup.js    # Backup-Restore
│   └── check-*.js                # Diagnose-Tools
├── public/                       # Statische Assets
├── .env.example                  # Environment-Template
├── SETUP.md                      # Setup-Anleitung
└── package.json                  # Node.js-Konfiguration
```

---

## 🎨 Funktionen im Detail

### 1. Repository-Analyse

#### Automatische Erkennung

Der Python-Analyzer (`analysis/analyzer.py`) führt folgende Analysen durch:

**Sprachen-Erkennung:**
- Nutzt GitHub Languages API
- Erkennt alle im Repository verwendeten Programmiersprachen
- Speichert relative Nutzung (Bytes pro Sprache)

**Framework-Detection:**
```python
# Erkannte Frameworks:
- Next.js (via package.json)
- React (via package.json)
- Vue (via package.json)
- Express (via package.json)
- Prisma (via package.json)
- Node.js (bei JavaScript/TypeScript-Projekten)
```

**Interface-Erkennung:**
- REST APIs (bei Next.js/Express)
- Datenbank-Verbindungen (bei Prisma/Supabase)
- Cloud-Services (via Environment-Variablen)

#### Verwendung

```bash
# Manuelle Ausführung
python analysis/analyzer.py

# Über Dashboard
# Klicken Sie auf "Sync" im Dashboard
```

**Ausgabe:**
- Erstellt `analysis_results.json` mit allen Repository-Daten
- Wird automatisch in Datenbank importiert via `npx prisma db seed`

#### Konfiguration

**Erforderliche Environment-Variablen:**
```env
GITHUB_TOKEN="ghp_..."      # GitHub Personal Access Token
GITHUB_OWNER="username"     # GitHub Username/Organization
```

**Token-Berechtigungen:**
- `repo` - Zugriff auf Repositories (inkl. private)
- `read:org` - Zugriff auf Organisationen

---

### 2. Business Canvas Management

#### Übersicht

Das Business Canvas-Feature ermöglicht die Bewertung des kommerziellen Potenzials jedes Repositories.

#### Komponenten

**Value Proposition:**
- Beschreibt den Mehrwert des Projekts
- Kategorien: Innovative Solution, Streamlined Workflow, Cost Reduction, etc.
- Wird als JSON-Array gespeichert

**Customer Segments:**
```json
{
  "name": "Content Creators",
  "confidence": 0.8,
  "pain_points": ["Consistent posting", "Visual quality", "Engagement"],
  "willingness_to_pay": "Medium ($15-50/mo)"
}
```

**Revenue Streams:**
```json
{
  "source": "Subscription",
  "model": "Pro Plan ($19/mo)",
  "potential_arr": 12000,
  "effort": "Low (Add Stripe)",
  "impact": "High"
}
```

**Cost Structure:**
```json
{
  "service": "Supabase",
  "amount": 25,
  "category": "Database",
  "optimizable": true,
  "note": "Consolidate projects?"
}
```

#### Bearbeitung

**Via UI:**
1. Navigieren Sie zu einem Repository
2. Klicken Sie auf "Edit Canvas"
3. Füllen Sie die Felder aus
4. Speichern Sie die Änderungen

**Via API:**
```typescript
// POST /api/repos/[name]/canvas
{
  "valueProposition": "[\"Innovative Solution\"]",
  "customerSegments": "[{...}]",
  "revenueStreams": "[{...}]",
  "costStructure": "[{...}]"
}
```

**Via Import:**
```bash
# Aus portfolio.json importieren
node scripts/import-portfolio.js
```

---

### 3. Deployment-Verwaltung

#### Unterstützte Provider

**Automatisch erkannt:**
- Vercel (via vercel.json oder .vercel)
- Fly.io (via fly.toml)
- Netlify (via netlify.toml)
- Supabase (via package.json dependency)

**Manuell verknüpfbar:**
- Alle 16 vorkonfigurierten Provider
- Custom Provider können hinzugefügt werden

#### DNS-Management

**Cloudflare-Integration:**

1. **Voraussetzungen:**
   ```env
   CLOUDFLARE_API_TOKEN="your_token"
   ```

2. **Domain verbinden:**
   - Öffnen Sie Repository-Details
   - Klicken Sie auf "Connect Domain"
   - Wählen Sie Zone (Domain)
   - Geben Sie Subdomain ein
   - Erstellen Sie CNAME-Record

3. **Automatische Konfiguration:**
   - CNAME zeigt auf Deployment-URL
   - Proxied durch Cloudflare (SSL, DDoS-Schutz)
   - Automatische DNS-Propagation

**Custom URLs:**
- Manuelle URL-Eingabe möglich
- Link Health Monitoring
- Status-Anzeige (Online/Offline)
- Latency-Messung

#### Link Health Monitoring

**Funktionsweise:**
```typescript
// Automatische Checks alle 30 Sekunden
fetch(`/api/check-link?url=${encodeURIComponent(url)}`)
  .then(res => res.json())
  .then(data => {
    // data.reachable: boolean
    // data.status: HTTP Status Code
    // data.latency: Response time in ms
  });
```

**Anzeige:**
- Grüner Punkt: Online (Status 200-299)
- Roter Punkt: Offline (Status 400+, Timeout)
- Tooltip zeigt Details (Status, Latency)

---

### 4. Architecture Decision Records (ADRs)

#### Was sind ADRs?

ADRs dokumentieren wichtige Architekturentscheidungen und deren Begründung.

#### Struktur

```typescript
{
  title: string;           // Eindeutiger Titel (z.B. "ADR-001: Next.js 16 Adoption")
  status: string;          // PROPOSED, ACCEPTED, DEPRECATED, SUPERSEDED
  context: string;         // Warum wurde diese Entscheidung nötig?
  decision: string;        // Was wurde entschieden?
  consequences: string;    // Welche Auswirkungen hat die Entscheidung?
  tags: string;           // Komma-getrennte Tags
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### Vordefinierte ADRs

Die Anwendung kommt mit 7 vordefinierten ADRs:

1. **ADR-001: Next.js 16 Adoption**
   - Standardisierung auf Next.js 16
   - App Router statt Pages Router
   - React Server Components

2. **ADR-002: TypeScript Strict Mode**
   - Strikte Typisierung
   - Bessere Code-Qualität
   - Frühere Fehlererkennung

3. **ADR-003: Node.js 20 LTS Mandate**
   - Mindestversion Node.js 20
   - Langzeit-Support
   - Moderne Features

4. **ADR-004: React Compiler Adoption**
   - Automatische Optimierung
   - Bessere Performance
   - Weniger manuelles Memoization

5. **ADR-005: Tailwind CSS v4 Target**
   - Migration zu Tailwind v4
   - Verbesserte Performance
   - Neue Features

6. **ADR-006: Interface Registry Standard**
   - Zentrale Interface-Dokumentation
   - YAML-basierte Registry
   - Automatische Validierung

7. **ADR-007: Hosting Strategy**
   - Vercel vs. Hetzner
   - Kosten-Nutzen-Analyse
   - Deployment-Strategie

#### Verwaltung

**Neue ADR erstellen:**
```bash
npx ts-node scripts/seed-adrs.ts
```

**Via API:**
```typescript
// POST /api/adrs
{
  "title": "ADR-008: Database Migration Strategy",
  "status": "PROPOSED",
  "context": "We need to migrate from SQLite to PostgreSQL...",
  "decision": "Use Prisma migrations with zero-downtime strategy...",
  "consequences": "Requires careful planning and testing...",
  "tags": "database,migration,infrastructure"
}
```

---

### 5. AI-gestützte Features

#### Architektur-Beratung

**Endpoint:** `/api/ai/architect`

**Funktionalität:**
- Analysiert Repository-Struktur
- Gibt Empfehlungen basierend auf ADRs
- Schlägt Verbesserungen vor
- Identifiziert Architektur-Probleme

**Verwendung:**
```typescript
// Chat-Interface unter /architect/chat
const response = await fetch('/api/ai/architect', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'How can I improve the architecture?' }
    ]
  })
});
```

**Konfiguration:**
```env
PERPLEXITY_API_KEY="pplx-..."
# oder
OPENAI_API_KEY="sk-..."
```

#### Task-Generierung

**Endpoint:** `/api/ai/tasks`

**Funktionalität:**
- Analysiert alle Repositories
- Generiert Wartungs-Tasks
- Identifiziert Security-Issues
- Schlägt Features vor

**Task-Typen:**
- **SECURITY**: Sicherheitsprobleme
- **MAINTENANCE**: Wartungsaufgaben
- **FEATURE**: Feature-Vorschläge

**Prioritäten:**
- **HIGH**: Kritisch, sofort handeln
- **MEDIUM**: Wichtig, bald erledigen
- **LOW**: Optional, bei Gelegenheit

**Verwendung:**
```bash
# Via Dashboard: Klick auf "Generate Tasks"
# Via API:
curl -X POST http://localhost:3000/api/ai/tasks
```

#### Repository-Beschreibungen

**Endpoint:** `/api/ai/describe`

**Funktionalität:**
- Generiert aussagekräftige Beschreibungen
- Analysiert Code und Dependencies
- Erstellt SEO-optimierte Texte
- Identifiziert Hauptfunktionen

**Verwendung:**
```typescript
const response = await fetch('/api/ai/describe', {
  method: 'POST',
  body: JSON.stringify({
    repoName: 'my-project',
    technologies: ['Next.js', 'Prisma', 'Tailwind'],
    readme: '# My Project...'
  })
});
```

---

### 6. Provider-Management

#### Übersicht

Provider repräsentieren externe Services, die von Repositories genutzt werden.

#### Vordefinierte Provider

**Kategorien:**

**Backend-as-a-Service:**
- Supabase
- Firebase
- AWS Amplify

**Hosting:**
- Vercel
- Netlify
- Fly.io
- Render

**Datenbanken:**
- PostgreSQL
- MongoDB
- Redis

**AI/ML:**
- OpenAI
- Anthropic
- Perplexity

**Payment:**
- Stripe
- Lemon Squeezy

**Monitoring:**
- Sentry
- LogRocket

#### Verwaltung

**Provider zu Repository hinzufügen:**
1. Öffnen Sie Repository-Details
2. Scrollen Sie zu "Connected Providers"
3. Wählen Sie Provider aus Dropdown
4. Klicken Sie "Add"

**Via API:**
```typescript
// POST /api/repos/[name]/providers
{
  "providerId": "provider-uuid"
}

// DELETE /api/repos/[name]/providers
{
  "providerId": "provider-uuid"
}
```

**Neue Provider hinzufügen:**
```bash
node scripts/seed-providers.js
```

---

## 🔌 API-Dokumentation

### Repository-Endpoints

#### GET /api/repos/[name]

**Beschreibung:** Ruft Details eines Repositories ab

**Parameter:**
- `name` (path): Repository-Name

**Response:**
```json
{
  "repo": {
    "name": "my-project",
    "fullName": "username/my-project",
    "url": "https://github.com/username/my-project",
    "description": "...",
    "isPrivate": false,
    "customUrl": "https://myproject.com",
    ...
  },
  "technologies": [...],
  "interfaces": [...],
  "deployments": [...],
  "providers": [...]
}
```

#### PATCH /api/repos/[name]

**Beschreibung:** Aktualisiert Repository-Daten

**Body:**
```json
{
  "customUrl": "https://newurl.com"
}
```

#### POST /api/repos/[name]/canvas

**Beschreibung:** Erstellt/Aktualisiert Business Canvas

**Body:**
```json
{
  "valueProposition": "[\"Innovation\"]",
  "customerSegments": "[{...}]",
  "revenueStreams": "[{...}]",
  "costStructure": "[{...}]"
}
```

### DNS-Endpoints

#### GET /api/dns

**Beschreibung:** Listet Cloudflare Zones auf

**Response:**
```json
[
  { "id": "zone-id", "name": "example.com" }
]
```

#### GET /api/dns?target=app.example.com

**Beschreibung:** Sucht DNS-Records für Target

**Response:**
```json
[
  {
    "id": "record-id",
    "name": "app.example.com",
    "type": "CNAME",
    "content": "myapp.vercel.app",
    "proxied": true
  }
]
```

#### POST /api/dns

**Beschreibung:** Erstellt DNS-Record

**Body:**
```json
{
  "zone_id": "zone-id",
  "type": "CNAME",
  "name": "app",
  "content": "target.vercel.app",
  "proxied": true
}
```

### Task-Endpoints

#### GET /api/tasks?repositoryId=repo-id

**Beschreibung:** Listet Tasks für Repository

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-id",
      "title": "Update dependencies",
      "status": "OPEN",
      "priority": "HIGH",
      "type": "MAINTENANCE"
    }
  ]
}
```

#### PATCH /api/tasks

**Beschreibung:** Aktualisiert Task-Status

**Body:**
```json
{
  "id": "task-id",
  "status": "COMPLETED"
}
```

#### POST /api/ai/tasks

**Beschreibung:** Generiert Tasks für alle Repositories

**Response:**
```json
{
  "success": true,
  "tasksGenerated": 15
}
```

---

## 🗄️ Datenbank-Schema

### Wichtigste Modelle

#### Repository
```prisma
model Repository {
  id                  String           @id @default(uuid())
  githubId            String?          @unique
  name                String
  fullName            String
  nameWithOwner       String
  url                 String
  description         String?
  isPrivate           Boolean          @default(false)
  customUrl           String?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  pushedAt            DateTime?
  language            String?
  defaultBranch       String?
  
  // Relations
  businessCanvas      BusinessCanvas?
  capabilities        Capability[]
  deployments         Deployment[]
  interfaces          Interface[]
  tasks               RepoTask[]
  technologies        Technology[]
  providers           Provider[]
}
```

#### BusinessCanvas
```prisma
model BusinessCanvas {
  id                    String     @id @default(uuid())
  repositoryId          String     @unique
  valueProposition      String?
  customerSegments      String?
  revenueStreams        String?
  costStructure         String?
  consolidationGroup    String?
  estimatedARR          Decimal?
  marketSize            String?
  monetizationPotential String?
  updatedAt             DateTime   @default(now())
  
  repository            Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
}
```

#### ArchitectureDecision
```prisma
model ArchitectureDecision {
  id           String   @id @default(uuid())
  title        String   @unique
  status       String   @default("PROPOSED")
  context      String
  decision     String
  consequences String
  tags         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Migrations

**Neue Migration erstellen:**
```bash
npx prisma migrate dev --name description
```

**Migration anwenden:**
```bash
npx prisma migrate deploy
```

**Schema aktualisieren (ohne Migration):**
```bash
npx prisma db push
```

---

## 🔄 Workflows

### Täglicher Workflow

**1. Morgens: Status-Check**
```bash
# Datenbank-Status prüfen
node check-db-counts.js

# Logs überprüfen
node check-logs.js

# Environment validieren
node check-env.js
```

**2. Repository-Sync**
```bash
# Neue/geänderte Repos analysieren
python analysis/analyzer.py

# Datenbank aktualisieren
npx prisma db seed
```

**3. Tasks überprüfen**
- Dashboard öffnen
- Offene Tasks durchgehen
- Prioritäten setzen
- Tasks abarbeiten

### Wöchentlicher Workflow

**1. Vollständiger Sync**
```bash
# Alle Repos neu analysieren
python analysis/analyzer.py

# Datenbank neu seeden
npx prisma db seed

# Portfolio-Daten importieren
node scripts/import-portfolio.js

# ADRs aktualisieren
npx ts-node scripts/seed-adrs.ts
```

**2. Business Canvas Review**
- Alle Canvases durchgehen
- ARR-Schätzungen aktualisieren
- Neue Revenue Streams identifizieren
- Cost Structure optimieren

**3. Architektur-Review**
- ADRs überprüfen
- Neue Entscheidungen dokumentieren
- Veraltete ADRs als DEPRECATED markieren
- AI-Beratung einholen

### Monatlicher Workflow

**1. Vollständige Analyse**
```bash
# AI-Tasks generieren
curl -X POST http://localhost:3000/api/ai/tasks

# Reports generieren
node scripts/seed-german-report.js
node scripts/seed-overview-report.js
```

**2. Provider-Audit**
- Ungenutzte Provider entfernen
- Neue Provider hinzufügen
- Kosten überprüfen
- Konsolidierungsmöglichkeiten prüfen

**3. Backup**
```bash
# Datenbank sichern
cp dev.db dev-backup-$(date +%Y%m%d).db

# Portfolio exportieren
node scripts/export-backup.js
```

---

## 👨‍💻 Entwickler-Guide

### Lokale Entwicklung

**1. Setup**
```bash
# Repository klonen
git clone <repo-url>
cd vibecoder-architect-reviewer

# Dependencies installieren
npm install
pip install -r analysis/requirements.txt

# Environment konfigurieren
cp .env.example .env.local
# .env.local bearbeiten

# Datenbank initialisieren
npx prisma generate
npx prisma db push
```

**2. Development Server**
```bash
npm run dev
# Öffnen Sie http://localhost:3000
```

**3. Datenbank-Tools**
```bash
# Prisma Studio (GUI)
npx prisma studio

# Migrations
npx prisma migrate dev

# Seed
npx prisma db seed
```

### Neue Features entwickeln

**1. API-Endpoint hinzufügen**

Erstellen Sie `app/api/my-feature/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.myModel.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

**2. UI-Komponente hinzufügen**

Erstellen Sie `app/my-feature/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, Title } from '@tremor/react';

export default function MyFeature() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/my-feature')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <Card>
      <Title>My Feature</Title>
      {/* Your UI here */}
    </Card>
  );
}
```

**3. Datenbank-Modell hinzufügen**

Bearbeiten Sie `prisma/schema.prisma`:
```prisma
model MyModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}
```

Dann:
```bash
npx prisma migrate dev --name add_my_model
npx prisma generate
```

### Testing

**Unit Tests:**
```bash
# Tests ausführen
npm test

# Coverage
npm run test:coverage
```

**E2E Tests:**
```bash
# Playwright Tests
npx playwright test

# UI Mode
npx playwright test --ui
```

### Code-Qualität

**Linting:**
```bash
npm run lint
```

**Formatting:**
```bash
npx prettier --write .
```

---

## 🚀 Deployment

### Vercel (Empfohlen)

**1. Vorbereitung**
```bash
# Build testen
npm run build

# Environment-Variablen vorbereiten
# Kopieren Sie alle aus .env.local
```

**2. Deployment**
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Production
vercel --prod
```

**3. Environment-Variablen**
- Gehen Sie zu Vercel Dashboard
- Settings → Environment Variables
- Fügen Sie alle Variablen aus `.env.example` hinzu

### Fly.io

**1. Dockerfile erstellen**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

**2. fly.toml**
```toml
app = "vibecoder-architect-reviewer"

[build]
  dockerfile = "Dockerfile"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

**3. Deployment**
```bash
fly deploy
```

### Self-Hosted

**1. Server vorbereiten**
```bash
# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python installieren
sudo apt-get install python3 python3-pip

# PM2 installieren
npm install -g pm2
```

**2. Anwendung deployen**
```bash
# Code klonen
git clone <repo-url>
cd vibecoder-architect-reviewer

# Dependencies
npm ci
pip3 install -r analysis/requirements.txt

# Build
npm run build

# PM2 starten
pm2 start npm --name "vibecoder" -- start
pm2 save
pm2 startup
```

**3. Nginx konfigurieren**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Wartung & Monitoring

### Logs

**Anwendungs-Logs:**
```bash
# Sync-Logs anzeigen
node check-logs.js

# PM2 Logs (Production)
pm2 logs vibecoder

# Vercel Logs
vercel logs
```

**Datenbank-Logs:**
```bash
# Prisma Query Logs
# Setzen Sie in .env:
DEBUG="prisma:query"
```

### Monitoring

**Health Checks:**
```bash
# Datenbank-Status
node check-db-counts.js

# Environment-Status
node check-env.js

# Link Health
# Automatisch im Dashboard
```

**Performance-Monitoring:**
- Vercel Analytics (automatisch)
- Custom Metrics via API

### Backups

**Automatisches Backup:**
```bash
# Cron Job erstellen
crontab -e

# Täglich um 2 Uhr
0 2 * * * cd /path/to/app && cp dev.db backups/dev-$(date +\%Y\%m\%d).db
```

**Manuelles Backup:**
```bash
# Datenbank
cp dev.db dev-backup.db

# Portfolio-Daten
node scripts/export-backup.js
```

**Restore:**
```bash
# Datenbank
cp dev-backup.db dev.db

# Portfolio-Daten
node scripts/import-portfolio.js
```

### Updates

**Dependencies aktualisieren:**
```bash
# Check for updates
npm outdated

# Update all
npm update

# Update major versions
npx npm-check-updates -u
npm install
```

**Prisma aktualisieren:**
```bash
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

---

## 🐛 Troubleshooting

### Häufige Probleme

#### 1. "GITHUB_TOKEN not set"

**Problem:** Python-Analyzer kann nicht auf GitHub zugreifen

**Lösung:**
```bash
# .env.local überprüfen
cat .env.local | grep GITHUB_TOKEN

# Token testen
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Neu setzen
echo 'GITHUB_TOKEN="ghp_..."' >> .env.local
```

#### 2. "Prisma Client not generated"

**Problem:** Datenbank-Queries schlagen fehl

**Lösung:**
```bash
npx prisma generate
npm run dev
```

#### 3. "Analysis results not found"

**Problem:** Seed-Skript findet keine Daten

**Lösung:**
```bash
# Analyzer ausführen
python analysis/analyzer.py

# Prüfen ob Datei existiert
ls -la analysis_results.json

# Seed erneut ausführen
npx prisma db seed
```

#### 4. "React Hooks order violation"

**Problem:** useState nach useEffect

**Lösung:**
- Alle useState Hooks an den Anfang der Komponente verschieben
- Vor allen useEffect Hooks platzieren
- Keine bedingten Hooks verwenden

#### 5. "Port 3000 already in use"

**Problem:** Port ist belegt

**Lösung:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Anderen Port verwenden
PORT=3001 npm run dev
```

### Debug-Modus

**Aktivieren:**
```env
# .env.local
DEBUG="*"
NODE_ENV="development"
```

**Prisma Debug:**
```env
DEBUG="prisma:query,prisma:info"
```

**Next.js Debug:**
```bash
NODE_OPTIONS='--inspect' npm run dev
```

### Performance-Probleme

**Langsame Queries:**
```bash
# Prisma Studio öffnen
npx prisma studio

# Indexes überprüfen
# schema.prisma:
@@index([field1, field2])
```

**Große Datenbank:**
```bash
# Vacuum (SQLite)
sqlite3 dev.db "VACUUM;"

# Alte Daten archivieren
node scripts/archive-old-data.js
```

---

## 📞 Support & Ressourcen

### Dokumentation

- **Setup-Guide**: `SETUP.md`
- **Release Notes**: `RELEASE_v0.11.1.md`
- **Analyzer-Docs**: `analysis/README.md`
- **API-Docs**: Dieser Guide

### Community

- **GitHub Issues**: Für Bug-Reports und Feature-Requests
- **Discussions**: Für Fragen und Ideen

### Nützliche Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tremor Docs](https://www.tremor.so/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [GitHub API](https://docs.github.com/en/rest)
- [Cloudflare API](https://developers.cloudflare.com/api/)

---

**Version:** 0.11.1  
**Letzte Aktualisierung:** 2025-12-11  
**Autor:** Vibecoder Team
