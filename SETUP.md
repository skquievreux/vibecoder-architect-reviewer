# Setup-Anleitung für Vibecoder Architect Reviewer

## 📋 Voraussetzungen

- **Node.js** >= 20.9.0
- **Python** 3.8 oder höher
- **Git**
- **GitHub Account** mit Personal Access Token

## 🚀 Schnellstart

### 1. Repository klonen und Abhängigkeiten installieren

```bash
# Repository klonen
git clone <repository-url>
cd vibecoder-architect-reviewer

# Node.js Abhängigkeiten installieren
npm install

# Python Abhängigkeiten installieren
pip install -r analysis/requirements.txt
```

### 2. Umgebungsvariablen konfigurieren

```bash
# .env.example nach .env.local kopieren
cp .env.example .env.local
```

Öffnen Sie `.env.local` und konfigurieren Sie mindestens diese Variablen:

```env
# Erforderlich
DATABASE_URL="file:./dev.db"
GITHUB_TOKEN="ghp_your_token_here"
GITHUB_OWNER="your-github-username"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional (für AI-Features)
PERPLEXITY_API_KEY="your_key_here"
OPENAI_API_KEY="your_key_here"
```

#### GitHub Token erstellen

1. Gehen Sie zu: https://github.com/settings/tokens
2. Klicken Sie auf "Generate new token (classic)"
3. Wählen Sie folgende Scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
4. Kopieren Sie den Token in `.env.local`

#### NextAuth Secret generieren

```bash
# Windows (PowerShell)
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Linux/Mac
openssl rand -base64 32
```

### 3. Datenbank initialisieren

```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Schema anwenden
npx prisma db push

# (Optional) Admin-User erstellen
npx ts-node scripts/create-admin.ts
```

### 4. Repositories analysieren und Datenbank füllen

```bash
# Python-Analyzer ausführen (analysiert GitHub Repos)
python analysis/analyzer.py

# Datenbank mit analysierten Daten füllen
npx prisma db seed
```

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist nun unter http://localhost:3000 verfügbar.

## 🔄 Daten synchronisieren

Um neue Repositories zu analysieren oder bestehende zu aktualisieren:

1. **Über das Dashboard**: Klicken Sie auf "Sync" im Dashboard
2. **Manuell**:
   ```bash
   python analysis/analyzer.py
   npx prisma db seed
   ```

## 📁 Projektstruktur

```
vibecoder-architect-reviewer/
├── analysis/              # Python-Analyseskripte
│   ├── analyzer.py       # Hauptskript für GitHub-Analyse
│   └── requirements.txt  # Python-Abhängigkeiten
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   └── ...
├── prisma/              # Prisma Schema & Migrations
│   ├── schema.prisma    # Datenbankschema
│   └── seed.ts          # Seed-Skript
├── scripts/             # Utility-Skripte
├── .env.example         # Beispiel-Umgebungsvariablen
└── package.json
```

## 🛠️ Nützliche Befehle

```bash
# Entwicklungsserver starten
npm run dev

# Production Build erstellen
npm run build

# Production Server starten
npm start

# Datenbank zurücksetzen
npx prisma db push --force-reset

# Prisma Studio öffnen (Datenbank-GUI)
npx prisma studio

# Logs überprüfen
node check-logs.js

# Datenbankstatus prüfen
node check-db.js
```

## 🐛 Fehlerbehebung

### "GITHUB_TOKEN not set"
- Stellen Sie sicher, dass `GITHUB_TOKEN` in `.env.local` gesetzt ist
- Token muss die Scopes `repo` und `read:org` haben

### "Analysis results not found"
- Führen Sie zuerst `python analysis/analyzer.py` aus
- Prüfen Sie, ob `analysis_results.json` erstellt wurde

### "Database connection error"
- Führen Sie `npx prisma generate` aus
- Führen Sie `npx prisma db push` aus

### Python-Modul nicht gefunden
```bash
pip install -r analysis/requirements.txt
```

## 📚 Weitere Dokumentation

- [SETUP_AUTH.md](./SETUP_AUTH.md) - Authentifizierung einrichten
- [APP_GESTARTET.md](./APP_GESTARTET.md) - App-Start-Anleitung
- [WORKFLOW.md](./WORKFLOW.md) - Entwicklungs-Workflow

## 🔐 Sicherheit

- **Niemals** `.env.local` oder `.env` in Git committen
- Verwenden Sie starke, zufällig generierte Secrets
- Rotieren Sie API-Keys regelmäßig
- Für Production: Verwenden Sie Umgebungsvariablen der Hosting-Plattform

## 📞 Support

Bei Problemen:
1. Überprüfen Sie die Logs: `node check-logs.js`
2. Prüfen Sie die Datenbankverbindung: `node check-db.js`
3. Konsultieren Sie die Dokumentation
