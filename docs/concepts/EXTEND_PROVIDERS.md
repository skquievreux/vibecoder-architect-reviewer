# Konzept: Erweiterung der Connected Providers

## 1. Zielsetzung
Das Ziel ist die Erweiterung der "Connected Providers" im Vibecoder Architect Reviewer, um ein vollständigeres Bild der IT-Landschaft zu erhalten. Es geht nicht nur um das bloße Auflisten, sondern um intelligente Erkennung und perspektivisch um tiefere Integrationen (z. B. Kostenanzeige, Status-Checks).

## 2. Erweiterung des Provider-Katalogs
Wir erweitern die Liste der unterstützten Provider in `seed-providers.js` um folgende Kategorien:

### A. Observability & Monitoring
- **Sentry**: Error Tracking. (Erkennung: `@sentry/nextjs` etc., `SENTRY_DSN`)
- **PostHog**: Analytics. (Erkennung: `posthog-js`, `NEXT_PUBLIC_POSTHOG_KEY`)
- **BetterStack**: Uptime Monitoring.

### B. Authentifizierung
- **Clerk**: Modern Auth. (Erkennung: `@clerk/nextjs`)
- **Auth0**: Enterprise Auth. (Erkennung: `auth0`)

### C. Backend & CMS
- **Sanity**: Headless CMS. (Erkennung: `sanity`)
- **PayloadCMS**: TypeScript CMS. (Erkennung: `payload`)
- **Resend**: Moderne Email API. (Erkennung: `resend`)

### D. AI & Vector Database
- **Pinecone**: Vektor-Datenbank. (Erkennung: `@pinecone-database/pinecone`)
- **LangChain**: AI Orchestration. (Erkennung: `langchain`)

## 3. Verbesserte Erkennungslogik (`link-providers.ts`)
Das Skript wird erweitert, um nicht nur nach Paketnamen, sondern auch nach spezifischen Konfigurationsdateien und Umgebungsvariablen-Mustern zu suchen.

**Neue Erkennungsmuster:**
- **Clerk:** Sucht nach `middleware.ts` mit `clerkMiddleware`.
- **Sentry:** Sucht nach `sentry.client.config.ts`.
- **Drizzle/Prisma:** Wird als "Database Provider" Technologie erkannt (bereits teilweise vorhanden, aber explizite Provider-Verknüpfung wie z.B. "Neon" via Connection String Analyse möglich).

## 4. UI-Integration & Manuelles Management
- **Repository Dashboard:** Anzeige der Provider als "Badges" mit Status (z. B. "Detected via package.json").
- **Manuelles Verknüpfen:** Ein neuer Dialog im Dashboard, um Provider, die nicht automatisch erkannt wurden (z. B. weil sie nur via API aufgerufen werden ohne SDK), manuell hinzuzufügen.

## 5. Live-Integration (Phase 2 - Ausblick)
Für ausgewählte "Premium Provider" (Vercel, OpenAI, Supabase) implementieren wir echte API-Clients im Dashboard.
- **Vorteil:** Anzeige von *monatlichen Kosten* und *Deployment-Status* direkt im Architekt-Review.
- **Umsetzung:** Nutzung globaler Admin-API-Keys im Dashboard (`.env.local`), um Daten für verknüpfte Projekte abzufragen.

---

## Nächste Schritte (Action Plan)

1.  **Update `seed-providers.js`**: Hinzufügen der neuen Provider-Definitionen.
2.  **Update `link-providers.ts`**: Implementierung der neuen Erkennungsregeln.
3.  **Ausführung**: `npm run seed:providers` und `npm run link:providers` ausführen, um die Datenbank zu aktualisieren.
4.  **UI Check**: Überprüfung im Dashboard.
