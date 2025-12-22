---
description: Wie man Commits und Releases handhabt, um Konflikte mit dem Semantic Bot zu vermeiden.
---

# Semantic Release Workflow

Dieser Workflow stellt sicher, dass wir keine Konflikte mit dem Semantic Release Bot erzeugen.

## Regel
**Niemals** `package.json` (Version) oder `CHANGELOG.md` manuell ändern.

## Prozess für Änderungen

1.  **Code ändern**: Führe die notwendigen Code-Änderungen durch.
2.  **Dateien prüfen**: Stelle sicher, dass `package.json` und `CHANGELOG.md` **nicht** in den gestageter Dateien sind, es sei denn, du änderst Dependencies (nicht Version).
3.  **Commit erstellen**: Nutze Conventional Commits.

### Commit Konventionen

| Typ | Auswirkung | Beispiel |
| :--- | :--- | :--- |
| `feat` | Minor Release (1.x.0) | `feat: add new dashboard widget` |
| `fix` | Patch Release (1.0.x) | `fix: resolve null pointer exception` |
| `perf` | Patch Release (1.0.x) | `perf: optimize image loading` |
| `docs` | Kein Release | `docs: update setup guide` |
| `chore` | Kein Release | `chore: update dependencies` |
| `refactor` | Kein Release | `refactor: simplify auth logic` |

## Konfliktlösung (Falls es doch passiert)

1.  **Remote Main holen**: `git fetch origin && git merge origin/main`
2.  **Version akzeptieren**: Akzeptiere IMMER die Version auf `origin/main` in `package.json`.
3.  **Changelog behalten**: Akzeptiere die HEAD-Änderungen im Changelog, aber platziere sie an der Spitze, ohne die Bot-Einträge zu löschen.
4.  **Push**: `git push`

---
// turbo-all
