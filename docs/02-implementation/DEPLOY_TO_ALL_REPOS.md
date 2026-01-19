---
title: "Workflows auf alle deine Repositories ausrollen"
type: "implementation"
audience: "developer"
status: "approved"
priority: "medium"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["workflow-templates-organization-guide.md"]
tags: ["deployment", "rollout", "automation", "github-actions"]
---

# Workflows auf alle deine Repositories ausrollen
# Einfache Schritt-für-Schritt Anleitung

## Liste deiner Repositories

Basierend auf dem Screenshot hast du folgende Repos:
- test-repo
- .github (skip - ist das Template-Repo)
- Karbendrop
- svg-grafik-generator
- DreamEdit
- comicgenerator-lecheries
- vibecoder-architect-reviewer

## 🚀 Methode 1: Einzelne Befehle (Copy & Paste)

### Für Karbendrop:

```powershell
cd C:\CODE\GIT\Karbendrop
mkdir -p .github\workflows -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\ -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\release.yml .github\workflows\ -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\ecosystem-guard.yml .github\workflows\ -Force
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

### Für svg-grafik-generator:

```powershell
cd C:\CODE\GIT\svg-grafik-generator
mkdir -p .github\workflows -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\ -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\release.yml .github\workflows\ -Force
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

### Für DreamEdit:

```powershell
cd C:\CODE\GIT\DreamEdit
mkdir -p .github\workflows -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\ -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\release.yml .github\workflows\ -Force
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

### Für comicgenerator-lecheries:

```powershell
cd C:\CODE\GIT\comicgenerator-lecheries
mkdir -p .github\workflows -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\ -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\release.yml .github\workflows\ -Force
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

### Für test-repo:

```powershell
cd C:\CODE\GIT\test-repo
mkdir -p .github\workflows -Force
Copy-Item C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\ -Force
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

## 🚀 Methode 2: Mit Helper-Script

```powershell
# Für jedes Repo:
.\scripts\deploy-to-repo.ps1 -RepoPath "C:\CODE\GIT\Karbendrop"
.\scripts\deploy-to-repo.ps1 -RepoPath "C:\CODE\GIT\svg-grafik-generator"
.\scripts\deploy-to-repo.ps1 -RepoPath "C:\CODE\GIT\DreamEdit"
.\scripts\deploy-to-repo.ps1 -RepoPath "C:\CODE\GIT\comicgenerator-lecheries"

# Dann in jedem Repo:
cd C:\CODE\GIT\Karbendrop
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

## 🎯 Empfohlene Workflows pro Repo-Typ

### Für Web-Apps (Karbendrop, DreamEdit, etc.):
- ✅ ci.yml (Linting & Building)
- ✅ release.yml (Versioning)
- ✅ ecosystem-guard.yml (Security)
- ⚠️ dashboard-sync.yml (nur wenn du Dashboard nutzt)

### Für Libraries/Tools:
- ✅ ci.yml
- ✅ release.yml
- ✅ ecosystem-guard.yml

### Für vibecoder-architect-reviewer:
- ✅ Alle Workflows (bereits vorhanden!)

## ✅ Verifizierung

Nach dem Deployment, überprüfe für jedes Repo:

1. Gehe zu: `https://github.com/skquievreux/REPO-NAME/actions`
2. Du solltest die neuen Workflows sehen
3. Sie werden beim nächsten Push/PR automatisch laufen

## 📊 Checkliste

- [ ] Karbendrop
- [ ] svg-grafik-generator
- [ ] DreamEdit
- [ ] comicgenerator-lecheries
- [ ] test-repo
- [x] vibecoder-architect-reviewer (bereits erledigt)
- [ ] Weitere Repos...

## 💡 Tipp

Du kannst auch direkt auf GitHub die Workflows hinzufügen:

1. Gehe zu einem Repo → Actions → New workflow
2. Wähle ein Template aus "By Steffen Quievreux"
3. Klicke Configure
4. Commit!

Das funktioniert aber nur für **neue Repos in der Organization** `skquievreux-org`.

---

**Welche Methode möchtest du nutzen?**

1. **Copy & Paste Befehle** - Schnell und einfach
2. **Helper-Script** - Etwas automatisierter
3. **GitHub UI** - Für zukünftige Repos in der Org

Sag mir Bescheid und ich helfe dir beim Ausrollen! 🚀
