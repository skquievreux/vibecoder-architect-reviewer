---
title: "Bulk Workflow Template Deployment Guide"
type: "implementation"
audience: "developer"
status: "approved"
priority: "high"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["ORGANIZATION_WORKFLOWS_SETUP.md"]
tags: ["deployment", "automation", "github-actions", "bulk"]
---

# Workflows auf alle Repositories ausrollen

## 🚀 Schnellstart

### Option 1: PowerShell Script (Empfohlen für Windows)

```powershell
# Erst mal Dry-Run zum Testen
.\scripts\bulk-deploy-workflows.ps1 -Owner skquievreux -DryRun

# Wenn alles gut aussieht, echtes Deployment
.\scripts\bulk-deploy-workflows.ps1 -Owner skquievreux
```

### Option 2: TypeScript Script

```bash
# Dry-Run
npx tsx scripts/bulk-deploy-workflows.ts --owner skquievreux --dry-run

# Echtes Deployment
npx tsx scripts/bulk-deploy-workflows.ts --owner skquievreux
```

## 📋 Was das Script macht

1. ✅ Holt alle deine Repositories von GitHub
2. ✅ Klont sie lokal (falls noch nicht vorhanden)
3. ✅ Kopiert die Workflow-Templates
4. ✅ Committed und pusht die Änderungen
5. ✅ Zeigt eine Zusammenfassung

## 🎯 Erweiterte Optionen

### Nur bestimmte Workflows deployen

```powershell
# Nur CI und Release
.\scripts\bulk-deploy-workflows.ps1 -Owner skquievreux -Workflows @('ci.yml', 'release.yml')
```

### Bestimmte Repos überspringen

```powershell
# Skip test-repos
.\scripts\bulk-deploy-workflows.ps1 -Owner skquievreux -SkipRepos @('.github', 'test-repo', 'old-project')
```

### Kombination

```powershell
.\scripts\bulk-deploy-workflows.ps1 `
    -Owner skquievreux `
    -Workflows @('ci.yml', 'ecosystem-guard.yml') `
    -SkipRepos @('.github', 'archived-project') `
    -DryRun
```

## ⚠️ Wichtige Hinweise

### Voraussetzungen

1. **GitHub CLI muss installiert sein:**
   ```powershell
   # Überprüfen
   gh --version
   
   # Falls nicht installiert:
   winget install --id GitHub.cli
   ```

2. **GitHub CLI muss authentifiziert sein:**
   ```powershell
   gh auth login
   ```

3. **Repositories müssen lokal geklont werden können:**
   - Genug Speicherplatz
   - SSH oder HTTPS Zugriff konfiguriert

### Was wird übersprungen

Das Script überspringt automatisch:
- ✅ Workflows, die bereits existieren (kein Überschreiben)
- ✅ Repositories in der Skip-Liste
- ✅ Das `.github` Template-Repository selbst

### Sicherheit

- **Dry-Run zuerst!** Immer erst mit `-DryRun` testen
- **Backup:** Git macht automatisch Backups (alles ist versioniert)
- **Rollback:** Falls etwas schief geht: `git revert HEAD`

## 📊 Beispiel-Output

```
🚀 Bulk Workflow Template Deployment
📦 Owner: skquievreux
🔍 Dry Run: False

🔍 Fetching repositories...
📋 Found 5 repositories (excluding skipped)

📦 Processing: Karbendrop
  ✓ Deployed: ci.yml
  ✓ Deployed: release.yml
  ⏭️  Already exists: dashboard-sync.yml
  📤 Committing and pushing...
  ✓ Pushed to GitHub
  ✅ Completed: Karbendrop

📦 Processing: vibecoder-architect-reviewer
  ⏭️  Already exists: ci.yml
  ⏭️  Already exists: release.yml
  ⏭️  Already exists: dashboard-sync.yml
  ⏭️  Already exists: ecosystem-guard.yml
  ⏭️  Already exists: rollout-standards.yml
  ✅ Completed: vibecoder-architect-reviewer

============================================================
📊 Deployment Summary
============================================================
✅ Successfully deployed: 5
⏭️  Skipped: 2
❌ Failed: 0

✨ Deployment complete!
```

## 🔧 Troubleshooting

### "gh: command not found"

**Problem:** GitHub CLI nicht installiert

**Lösung:**
```powershell
winget install --id GitHub.cli
gh auth login
```

### "Permission denied"

**Problem:** Keine Schreibrechte auf Repository

**Lösung:**
- Überprüfe GitHub Permissions
- Stelle sicher, dass du Owner/Admin bist

### "Repository not found"

**Problem:** Repository existiert nicht oder ist privat

**Lösung:**
- Überprüfe Repository-Namen
- Stelle sicher, dass du Zugriff hast
- Nutze `--skip` um es zu überspringen

### Script hängt

**Problem:** Git fragt nach Credentials

**Lösung:**
```powershell
# SSH Keys konfigurieren oder
gh auth login
```

## 🎯 Manuelle Alternative

Falls das Script nicht funktioniert, kannst du Workflows auch manuell kopieren:

```powershell
# Für jedes Repository:
cd C:\CODE\GIT\MeinRepo
mkdir -p .github\workflows

# Workflows kopieren
cp C:\CODE\GIT\.github-org-temp\workflow-templates\ci.yml .github\workflows\
cp C:\CODE\GIT\.github-org-temp\workflow-templates\release.yml .github\workflows\

# Commit und push
git add .github\workflows
git commit -m "chore: add workflow templates"
git push
```

## 📚 Weitere Informationen

- **ADR-011**: `docs/adr/011-organization-workflow-templates.md`
- **Setup Guide**: `ORGANIZATION_WORKFLOWS_SETUP.md`
- **Verification**: `WORKFLOW_TEMPLATES_VERIFICATION.md`

---

**Erstellt**: 2025-12-17
**Für**: Bulk-Deployment von Workflow Templates
