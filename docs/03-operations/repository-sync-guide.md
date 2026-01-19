---
title: "Repository Sync Operations Guide"
type: "operations"
audience: "operator"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-23"
updated: "2025-12-23"
tags: ["sync", "github-actions", "dashboard"]
---

# 🔄 Repository Sync Operations Guide

Dieser Guide beschreibt, wie Sie die Synchronisation aller Repositories (lokal und remote) mit dem Developer Portal durchführen. Wir nutzen einen hybriden Ansatz (Harvester + Local Sync), um alle 100+ Projekte abzudecken.

## 📋 Überblick: Zwei Methoden

| Methode | Zielgruppe | Wann nutzen? |
|---------|------------|--------------|
| **A. Remote Harvester** | Die 60+ rein remote liegenden Repos | **Regulärer Betrieb** (z.B. wöchentlich oder ad-hoc) |
| **B. Local Sync** | Die 10+ lokal ausgecheckten Pilot-Repos | **Entwicklung & Tests** neuer Features direkt vom PC |

---

## 🛠 Methode A: Remote Harvester (Für ALLES)

Dies ist der effizienteste Weg, um **alle** Repositories auf einen Schlag zu aktualisieren, ohne Code auszuchecken.

### Voraussetzungen
1. GitHub Secret `GH_PAT` (Personal Access Token mit `repo` Scope) ist im Dashboard-Repo gesetzt.
2. GitHub Secret `DASHBOARD_API_KEY` (`dashboard-master-2024`) ist gesetzt.

### Durchführung (Schritt-für-Schritt)

1. **GitHub Actions öffnen**:
   Gehen Sie zu: `https://github.com/skquievreux/vibecoder-architect-reviewer/actions`

2. **Workflow auswählen**:
   Klicken Sie links auf **"Remote Repository Harvester (Bulk Sync)"**.

3. **Workflow starten**:
   - Klicken Sie rechts auf **"Run workflow"**.
   - **Branch**: `main` (oder aktueller Feature-Branch).
   - **Limit**: `0` für ALLE Repos, oder z.B. `5` für einen Test.
   - **Dry Run**: `false` (um Daten wirklich zu senden).
   - Klicken Sie auf den grünen Button **"Run workflow"**.

4. **Überwachung**:
   - Warten Sie, bis der Job durchgelaufen ist (ca. 2-5 Minuten).
   - Prüfen Sie die Logs auf "✅ Success" Meldungen.

---

## 💻 Methode B: Local Pilot Sync (Vom PC)

Nutzen Sie dies, wenn Sie lokal an Projekten arbeiten und Änderungen sofort im Dashboard sehen wollen.

### Voraussetzungen
- PowerShell 7 oder Windows PowerShell
- Die Repositories liegen in `C:\CODE\GIT\...` (parallel zum Dashboard-Repo)
- Master Key: `dashboard-master-2024`

### Durchführung

1. **Terminal öffnen** (in `vibecoder-architect-reviewer`).

2. **Skript starten**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File ".\scripts\pilot-sync.ps1"
   ```

3. **Was passiert?**
   - Das Skript scannt die lokalen Ordner (`../[RepoName]`).
   - Es sucht nach echten API-Specs (`openapi.json`, `swagger.yaml`).
   - Es sendet den aktuellen Stand direkt an das Dashboard.

### Troubleshooting
- **"Keine API Spec gefunden"**: Prüfen Sie, ob Sie lokal `npm run build` ausgeführt haben oder ob die Datei `openapi.json` existiert.
- **"HTTP 401"**: Der API Key im Skript stimmt nicht (Variable `$MASTER_API_KEY`).

---

## 🤖 Automatisierung in den Repositories

Für eine dauerhafte Lösung (Push-basiert) können Sie den Workflow in die Projekte verteilen:

1. **Verteilen**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File ".\scripts\distribute-workflow.ps1"
   ```

2. **Aktivieren**:
   Gehen Sie in die einzelnen Repo-Ordner, committen und pushen Sie die neuen Workflows:
   ```bash
   cd ../DevVault
   git add .github/workflows/dashboard-sync.yml
   git commit -m "ci: add sync workflow"
   git push
   ```

---

## 🆘 Support & Debugging

- **Dashboard Logs**: Prüfen Sie im Dashboard-Code (`route.ts`) die Server-Logs.
- **Master Key Rotation**: Der Key `dashboard-master-2024` ist hardcoded. Bei Security-Bedarf muss er in `.env` und Skripten geändert werden.
