# 🔌 Developer Portal

Das Developer Portal bietet eine zentrale Übersicht über alle API-Dokumentationen Ihrer Repositories.

## Features

### 📚 API-Dokumentation
- **OpenAPI 3.0 Spezifikationen** für alle Repositories mit APIs
- **Interaktive Swagger UI** zum Testen der Endpoints
- **Automatische Erkennung** von Next.js, Express und anderen API-Frameworks

### 🎯 Funktionen

#### Haupt-Portal (`/developer`)
- Übersicht aller Repositories mit API-Dokumentation
- Kategorisierung (Public API / Internal API)
- Version und Beschreibung
- Direkter Zugriff auf detaillierte Dokumentation

#### Detail-Ansicht (`/developer/[name]`)
- Vollständige OpenAPI-Spezifikation
- Interaktive Swagger UI
- Endpoint-Testing
- Request/Response-Beispiele
- Schema-Definitionen

## Verwendung

### API-Spezifikationen hinzufügen

#### Option 1: Automatisch (für erkannte APIs)

```bash
# Führen Sie das Seed-Skript aus
node scripts/seed-api-specs.js
```

Das Skript erkennt automatisch Repositories mit:
- Next.js API Routes
- Express/Fastify Frameworks
- Erkannten API-Interfaces

#### Option 2: Manuell

```javascript
// In Ihrem Repository: openapi.json erstellen
{
  "openapi": "3.0.0",
  "info": {
    "title": "My API",
    "version": "1.0.0",
    "description": "API description"
  },
  "servers": [
    {
      "url": "https://api.example.com",
      "description": "Production"
    }
  ],
  "paths": {
    "/endpoint": {
      "get": {
        "summary": "Get data",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  }
}
```

Dann in der Datenbank speichern:

```javascript
await prisma.repository.update({
  where: { name: 'my-repo' },
  data: {
    apiSpec: JSON.stringify(openApiSpec, null, 2)
  }
});
```

## Vibecoder Architect Reviewer API

Die Haupt-API dieser Anwendung ist vollständig dokumentiert und verfügbar unter:

**URL:** `/developer/vibecoder-architect-reviewer`

### Wichtigste Endpoints

#### Repositories
- `GET /api/repos/{name}` - Repository-Details abrufen
- `PATCH /api/repos/{name}` - Repository aktualisieren
- `POST /api/repos/{name}/canvas` - Business Canvas erstellen/aktualisieren
- `POST /api/repos/{name}/providers` - Provider verknüpfen
- `DELETE /api/repos/{name}/providers` - Provider entfernen

#### AI-Features
- `POST /api/ai/tasks` - Tasks generieren
- `POST /api/ai/architect` - Architektur-Beratung
- `POST /api/ai/describe` - Repository-Beschreibung generieren

#### DNS-Management
- `GET /api/dns` - Cloudflare Zones auflisten
- `GET /api/dns?target={url}` - DNS-Records suchen
- `POST /api/dns` - DNS-Record erstellen

#### Tasks
- `GET /api/tasks?repositoryId={id}` - Tasks für Repository
- `PATCH /api/tasks` - Task-Status aktualisieren

#### Providers
- `GET /api/providers` - Alle Provider auflisten

#### System
- `POST /api/system/sync` - Repositories synchronisieren

### Authentifizierung

Die meisten Endpoints erfordern keine Authentifizierung in der lokalen Entwicklungsumgebung. In der Produktion sollten Sie NextAuth.js konfigurieren.

## Beispiele

### Repository-Details abrufen

```bash
curl http://localhost:3000/api/repos/vibecoder-architect-reviewer
```

### Task generieren

```bash
curl -X POST http://localhost:3000/api/ai/tasks
```

### DNS-Record erstellen

```bash
curl -X POST http://localhost:3000/api/dns \
  -H "Content-Type: application/json" \
  -d '{
    "zone_id": "zone-id",
    "type": "CNAME",
    "name": "app",
    "content": "myapp.vercel.app",
    "proxied": true
  }'
```

## Entwicklung

### Neue API-Spezifikation hinzufügen

1. **OpenAPI-Spec erstellen:**
   ```javascript
   const spec = {
     openapi: '3.0.0',
     info: {
       title: 'My API',
       version: '1.0.0'
     },
     paths: { /* ... */ }
   };
   ```

2. **In Datenbank speichern:**
   ```javascript
   await prisma.repository.update({
     where: { name: 'repo-name' },
     data: { apiSpec: JSON.stringify(spec) }
   });
   ```

3. **Portal aufrufen:**
   - Navigieren Sie zu `/developer`
   - Klicken Sie auf das Repository
   - Swagger UI zeigt die Dokumentation

### Swagger UI anpassen

Die Swagger UI kann in `app/developer/[name]/client.tsx` angepasst werden:

```typescript
<SwaggerUI 
  spec={spec}
  docExpansion="list"
  defaultModelsExpandDepth={1}
  displayRequestDuration={true}
/>
```

## Troubleshooting

### "No Documentation Found"

**Problem:** Portal zeigt keine Repositories

**Lösung:**
```bash
# API-Spezifikationen seeden
node scripts/seed-api-specs.js

# Datenbank überprüfen
npx prisma studio
# Prüfen Sie Repository.apiSpec Feld
```

### "API Specification not found"

**Problem:** Detailseite zeigt Fehler

**Lösung:**
```bash
# Prüfen Sie ob apiSpec gesetzt ist
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.repository.findFirst({
  where: { name: 'repo-name' }
}).then(r => console.log(r.apiSpec ? 'Has spec' : 'No spec'));
"
```

### Swagger UI lädt nicht

**Problem:** Weiße Seite oder Fehler

**Lösung:**
```bash
# Swagger UI neu installieren
npm install swagger-ui-react

# Dev-Server neu starten
npm run dev
```

## Best Practices

### 1. Vollständige Spezifikationen

Stellen Sie sicher, dass Ihre OpenAPI-Specs vollständig sind:
- ✅ Alle Endpoints dokumentiert
- ✅ Request/Response-Schemas definiert
- ✅ Beispiele hinzugefügt
- ✅ Fehler-Codes dokumentiert

### 2. Versionierung

Verwenden Sie semantische Versionierung:
```json
{
  "info": {
    "version": "1.2.3"
  }
}
```

### 3. Tags verwenden

Organisieren Sie Endpoints mit Tags:
```json
{
  "tags": [
    { "name": "Users", "description": "User management" },
    { "name": "Posts", "description": "Post operations" }
  ],
  "paths": {
    "/users": {
      "get": {
        "tags": ["Users"]
      }
    }
  }
}
```

### 4. Sicherheit dokumentieren

Definieren Sie Authentifizierungsmethoden:
```json
{
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer"
      }
    }
  },
  "security": [
    { "bearerAuth": [] }
  ]
}
```

## Weiterführende Ressourcen

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Docs](https://swagger.io/tools/swagger-ui/)
- [API Design Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

---

**Version:** 0.11.1  
**Letzte Aktualisierung:** 2025-12-11
