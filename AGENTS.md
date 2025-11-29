# AGENTS.md

## Build/Lint/Test-Befehle

### Dashboard (Next.js/TypeScript)
- **Build**: `cd dashboard && npm run build`
- **Dev**: `cd dashboard && npm run dev`
- **Lint**: `cd dashboard && npm run lint`
- **Verify**: `cd dashboard && npm run verify`
- **Einzelner Test**: Kein dedizierter Test-Runner konfiguriert

### Analysis (Python)
- **Ausführen**: `cd analysis && python analyzer.py`
- **Lint**: Kein Linter konfiguriert
- **Test**: Kein Test-Framework konfiguriert

## Code-Style-Richtlinien

### TypeScript/React (Dashboard)
- **Strict mode**: Aktiviert in tsconfig.json
- **Target**: ES2017 mit moderner Lib-Unterstützung
- **JSX**: React JSX-Syntax
- **Imports**: ES-Module, verwende `@/*` Pfad-Alias für App-Verzeichnis
- **Naming**: camelCase für Variablen/Funktionen, PascalCase für Komponenten
- **Error handling**: Verwende try/catch-Blöcke, vermeide Werfen in Komponenten
- **Types**: Explizite Typisierung erforderlich, verwende Interfaces für komplexe Objekte

### Python (Analysis)
- **Imports**: Standardbibliothek zuerst, dann Drittanbieter, alphabetische Reihenfolge
- **Naming**: snake_case für Variablen/Funktionen, PascalCase für Klassen
- **Error handling**: Verwende try/except-Blöcke mit spezifischen Ausnahmen
- **Docstrings**: Verwende dreifache Anführungszeichen für Funktionsdokumentation
- **Zeilenlänge**: Kein explizites Limit, halte lesbar

### Allgemein
- **Formatting**: ESLint handhabt JS/TS, manuelle Formatierung für Python
- **Commits**: Verwende konventionelle Commit-Nachrichten
- **Secrets**: Commite niemals API-Schlüssel, Tokens oder sensible Konfiguration</content>
<parameter name="filePath">/home/ladmin/Desktop/GIT/ArchitekturReview/AGENTS.md