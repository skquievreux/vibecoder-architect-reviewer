# Mitwirken am VibeCoder Architect Reviewer

Wir freuen uns über Beiträge! Um Konflikte mit unserem automatisierten Release-Prozess zu vermeiden, bitte unbedingt folgende Regeln beachten.

## 🚨 WICHTIG: Vermeidung von Release-Konflikten

Wir verwenden **Semantic Release** (Bot), um Versionierung und Changelogs automatisch zu verwalten.

**Regel #1: Bearbeite NIEMALS manuell die `version` in `package.json`!**
**Regel #2: Bearbeite NIEMALS manuell die `CHANGELOG.md`!**

Der Bot berechnet die nächste Version basierend auf deinen Commit-Nachrichten, sobald ein Merge in `main` erfolgt.

## ✅ Der richtige Workflow

1.  **Feature Branch erstellen**: `feat/mein-neues-feature`
2.  **Code ändern**: Ändere nur den Quellcode, niemals Versionsnummern.
3.  **Conventional Commits nutzen**: Deine Commit-Nachrichten steuern den Bot.

### Commit-Typen

*   `feat: ...` -> Erzeugt ein **Minor** Update (z.B. 1.1.0 -> 1.2.0)
*   `fix: ...` -> Erzeugt ein **Patch** Update (z.B. 1.1.0 -> 1.1.1)
*   `perf: ...` -> Erzeugt ein **Patch** Update (Performance)
*   `docs: ...` -> Keine neue Version (Dokumentation)
*   `chore: ...` -> Keine neue Version (Wartung)

### Beispiel

**FALSCH ❌**:
- Commit: "neue funktion fertig"
- Manuelle Änderung von `package.json` auf 1.3.0

**RICHTIG ✅**:
- Commit: "feat: add automated portfolio analysis pipeline"
- KEINE Änderung an `package.json`

## Pull Request
Wenn du deinen PR erstellst, kümmert sich die CI/CD Pipeline um den Rest. Konflikte in `CHANGELOG.md` entstehen nur, wenn du versuchst, die Arbeit des Bots manuell zu erledigen.
