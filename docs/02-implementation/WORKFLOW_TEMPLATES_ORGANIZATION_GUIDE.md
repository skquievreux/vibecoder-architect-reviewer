---
title: "GitHub Organization für Workflow Templates Guide"
type: "implementation"
audience: "developer"
status: "approved"
priority: "medium"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["ORGANIZATION_WORKFLOWS_SETUP.md"]
tags: ["github", "organization", "templates", "guide"]
---

# Anleitung: GitHub Organization für Workflow Templates

## Problem
Workflow Templates funktionieren nur in GitHub Organizations, nicht für persönliche Accounts.

## Lösung: Organization erstellen

### Schritt 1: Organization erstellen

1. Gehe zu: https://github.com/account/organizations/new?plan=free
2. **Organization name**: `skquievreux-org` (oder ein anderer Name)
3. **Contact email**: Deine E-Mail
4. **This organization belongs to**: My personal account
5. Klicke **Next**
6. Überspringe Team-Einladungen (klicke **Complete setup**)

### Schritt 2: .github Repository zur Organization verschieben

**Option A: Neues Repository in Organization erstellen**

1. Gehe zu: https://github.com/organizations/skquievreux-org/repositories/new
2. **Repository name**: `.github` (exakt so!)
3. **Visibility**: Public
4. Klicke **Create repository**

5. Pushe die Templates:
```bash
cd C:\CODE\GIT\.github-org-temp
git remote set-url origin https://github.com/skquievreux-org/.github.git
git push -u origin main
```

**Option B: Bestehendes Repository transferieren**

1. Gehe zu: https://github.com/skquievreux/Organisation-Repo/settings
2. Scrolle zu **Danger Zone**
3. Klicke **Transfer**
4. Wähle deine Organization: `skquievreux-org`
5. Benenne es zu `.github` um

### Schritt 3: Neue Repositories in der Organization erstellen

Wenn du jetzt ein Repository in `skquievreux-org` erstellst, werden die Templates automatisch angezeigt!

---

## Alternative: Templates manuell nutzen (ohne Organization)

Wenn du keine Organization erstellen möchtest, kannst du die Templates trotzdem nutzen:

### Für neue Repositories:

```bash
# 1. Erstelle neues Repository
gh repo create mein-neues-projekt

# 2. Kopiere Workflows
cd mein-neues-projekt
mkdir -p .github/workflows

# 3. Kopiere Templates
cp /pfad/zu/.github/workflow-templates/*.yml .github/workflows/

# 4. Commit und push
git add .github/workflows
git commit -m "chore: add workflow templates"
git push
```

### Für existierende Repositories:

```bash
# Im Repository-Verzeichnis
mkdir -p .github/workflows

# Kopiere gewünschte Workflows
cp C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\
cp C:\CODE\GIT\.github-org-temp\workflow-templates\release.yml .github\workflows\

# Commit
git add .github/workflows
git commit -m "chore: add CI and Release workflows"
git push
```

---

## Empfehlung

**Für professionelle Nutzung**: Erstelle eine Organization
- ✅ Templates erscheinen automatisch
- ✅ Zentrale Verwaltung
- ✅ Team-Kollaboration möglich
- ✅ Professionelleres Erscheinungsbild

**Für persönliche Projekte**: Manuelle Kopie
- ✅ Einfacher
- ✅ Keine Organization nötig
- ⚠️ Muss bei jedem neuen Projekt wiederholt werden

---

## Nächste Schritte

1. Entscheide: Organization oder manuell?
2. Wenn Organization: Folge Schritt 1-3 oben
3. Wenn manuell: Nutze die Copy-Befehle für jedes Projekt

## Hilfe

Bei Fragen siehe:
- [GitHub: Creating an organization](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch)
- [GitHub: Workflow templates](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)
