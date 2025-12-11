# 🔐 Authentifizierung einrichten

## Schnellstart

Führen Sie diese Befehle aus, um sich einloggen zu können:

### 1. Umgebungsvariablen erstellen

```powershell
# Erstellen Sie die .env.local Datei
@"
# NextAuth Configuration
NEXTAUTH_SECRET=development-secret-key-change-in-production-12345678
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=file:./dev.db

# Admin User (for create-admin script)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

### 2. Datenbank initialisieren

```powershell
npx prisma db push
```

### 3. Admin-Benutzer erstellen

```powershell
npx ts-node scripts/create-admin.ts
```

### 4. Server neu starten

Stoppen Sie den aktuellen Server (Ctrl+C) und starten Sie ihn neu:

```powershell
npm run dev
```

## 📧 Standard-Anmeldedaten

Nach Ausführung der Schritte können Sie sich mit folgenden Daten einloggen:

- **Email**: `admin@example.com`
- **Passwort**: `admin123`

⚠️ **Wichtig**: Ändern Sie das Passwort nach dem ersten Login!

## 🔧 Anmeldedaten anpassen

Sie können die Anmeldedaten in der `.env.local` Datei ändern:

```env
ADMIN_EMAIL=ihre-email@example.com
ADMIN_PASSWORD=ihr-sicheres-passwort
ADMIN_NAME=Ihr Name
```

Führen Sie dann erneut `npx ts-node scripts/create-admin.ts` aus.

## 🌐 Login-URL

Nach dem Start des Servers:
- Öffnen Sie: http://localhost:3000
- Sie werden automatisch zur Login-Seite weitergeleitet
- Oder gehen Sie direkt zu: http://localhost:3000/auth/signin
