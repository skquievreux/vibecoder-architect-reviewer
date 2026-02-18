# 🛡️ Architektur-Audit & Stabilitäts-Strategie

## 1. Warum wir "kreisen" (Root Cause Analysis)

Wir leiden unter **"Manual Descriptor Mutation"**. 
- **Symptom**: `package.json` wird editiert -> Lockfile bleibt alt -> CI bricht ab.
- **Ursache**: Der Agent (ich) kann lokal kein Full-Install machen (keine Registry-Tokens für private Scopes, IO-Limits). 
- **Fehler-Kaskade**: Da ich die Lockfile nicht sauber regenerieren kann, "rate" ich beim Editieren der Lockfile (declarative sync), was oft fehleranfällig ist.

## 2. Paketmanager-Bewertung

### PNPM (Bleiben)
- **Pro**: Beste Wahl für Monorepos. Verhindert "Phantom Dependencies". Extrem platzsparend.
- **Contra**: Sehr strikt. Jeder Drift führt zum Error.
- **Optimierung**: `--lockfile-only` Modus konsequent nutzen, wenn Full-Install nicht möglich ist.

### Bun (Alternative)
- **Pro**: Unglaublich schnell.
- **Contra**: Prisma + Next.js 16 + React 19 ist eine riskante Kombination für Bun. Build-Artefakte weichen manchmal ab.
- **Urteil**: Zu riskant für die aktuelle Stufe.

## 3. Der "Stabilisierungs-Pfad" (Minimaler Aufwand, maximale Wirkung)

### Kurzfristig (Sofort-Fix)
- [ ] **Lockfile-Auto-Fix**: Script in GitHub Actions, das bei Lockfile-Fehlern automatisch einen Commit mit der korrekten Version zurückschreibt.
- [ ] **Strict Engine Locking**: Versionen in `package.json` von `^` auf feste Versionen umstellen, wo Geschwindigkeit zweitrangig gegenüber Vorhersehbarkeit ist.

### Mittelfristig (Architektur)
- [ ] **Custom Registry Proxy**: Alle `@squievreux` Pakete über eine Proxy-Registry laufen lassen, die keine lokalen Tokens benötigt oder diese sicher cached.
- [ ] **Turbo Repo Integration**: Vollständige Nutzung von Pipelines, um nur das zu bauen, was sich geändert hat.

## 4. Work-Plan

### Schritt 1: PNPM Config aufräumen
- Konsolidierung der `.npmrc`.
- Einführung von `shamefully-hoist=false` (schrittweise), um Abhängigkeits-Klarheit zu erzwingen.

### Schritt 2: CI/CD Guardrails
- GitHub Action, die `pnpm install --frozen-lockfile` als blockierenden Step für JEDEN PR nutzt.

---

**Ready to Implement?** Bitte bestätige den Plan, dann starte ich mit der technischen Umsetzung der Guardrails.
