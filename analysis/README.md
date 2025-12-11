# GitHub Repository Analyzer

Dieses Python-Skript analysiert GitHub-Repositories und generiert eine JSON-Datei mit detaillierten Informationen über Technologien, Sprachen und Schnittstellen.

## Voraussetzungen

- Python 3.8+
- GitHub Personal Access Token

## Installation

```bash
pip install -r requirements.txt
```

## Konfiguration

Setzen Sie die folgenden Umgebungsvariablen in Ihrer `.env.local` Datei:

```env
GITHUB_TOKEN="ghp_your_token_here"
GITHUB_OWNER="your-github-username-or-org"
```

## Verwendung

### Manuell ausführen

```bash
# Von der Projekt-Root aus
python analysis/analyzer.py

# Oder direkt im analysis-Verzeichnis
cd analysis
python analyzer.py
```

### Über das Dashboard

Klicken Sie im Dashboard auf den "Sync"-Button, um das Skript automatisch auszuführen.

## Ausgabe

Das Skript erstellt eine `analysis_results.json` Datei im Projekt-Root mit folgendem Format:

```json
[
  {
    "repo": {
      "id": 123456789,
      "name": "repository-name",
      "fullName": "owner/repository-name",
      "nameWithOwner": "owner/repository-name",
      "url": "https://github.com/owner/repository-name",
      "description": "Repository description",
      "isPrivate": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-11T00:00:00Z",
      "pushedAt": "2024-12-11T00:00:00Z",
      "languages": [
        {"node": {"name": "TypeScript"}},
        {"node": {"name": "JavaScript"}}
      ],
      "defaultBranchRef": {
        "name": "main"
      }
    },
    "technologies": [
      {
        "name": "TypeScript",
        "category": "language",
        "version": null
      },
      {
        "name": "Next.js",
        "category": "framework",
        "version": "16.0.5"
      },
      {
        "name": "Prisma",
        "category": "database",
        "version": "^5.22.0"
      }
    ],
    "interfaces": [
      {
        "type": "REST API",
        "direction": "PROVIDES",
        "details": {"framework": "Next.js"}
      },
      {
        "type": "Database",
        "direction": "CONSUMES",
        "details": {"orm": "Prisma"}
      }
    ]
  }
]
```

## Erkannte Technologien

Das Skript erkennt automatisch:

### Sprachen
- Alle von GitHub gemeldeten Programmiersprachen

### Frameworks & Runtimes
- **Next.js** - Erkannt über package.json
- **React** - Erkannt über package.json
- **Vue** - Erkannt über package.json
- **Express** - Erkannt über package.json
- **Node.js** - Erkannt bei JavaScript/TypeScript-Projekten

### Datenbanken & ORMs
- **Prisma** - Erkannt über package.json

### Schnittstellen
- **REST API** - Bei Next.js/Express-Projekten
- **Database** - Bei Prisma-Nutzung

## Erweiterung

Um weitere Technologien zu erkennen, bearbeiten Sie die Methode `detect_technologies()` in `analyzer.py`:

```python
def detect_technologies(self, repo_full_name: str, languages: List[str]) -> List[Dict[str, Any]]:
    # Fügen Sie hier Ihre eigene Erkennungslogik hinzu
    pass
```

## Fehlerbehebung

### "GITHUB_TOKEN not set"
Stellen Sie sicher, dass die Umgebungsvariable `GITHUB_TOKEN` in `.env.local` gesetzt ist.

### "GITHUB_OWNER not set"
Setzen Sie `GITHUB_OWNER` auf Ihren GitHub-Benutzernamen oder Organisationsnamen.

### "requests module not found"
Führen Sie `pip install -r requirements.txt` aus.

### Rate Limiting
Das Skript ist auf 100 Repositories begrenzt, um GitHub API Rate Limits zu vermeiden. Passen Sie dies bei Bedarf in der `get_repositories()` Methode an.

## API Rate Limits

GitHub API hat folgende Limits:
- **Authentifiziert**: 5.000 Anfragen pro Stunde
- **Unauthentifiziert**: 60 Anfragen pro Stunde

Das Skript verwendet authentifizierte Anfragen mit Ihrem Token.
