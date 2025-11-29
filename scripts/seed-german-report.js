const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding German Project Overview Report...');

    const reportContent = `
# Projekt-Überblick: Architektur & Gesundheitsstatus

**Generiert von:** Antigravity AI (Manuell)
**Datum:** ${new Date().toLocaleDateString('de-DE')}

## 1. Management Summary
Die Systemlandschaft befindet sich in einer **Übergangsphase**. Während das zentrale [Dashboard](/repo/dashboard) (Next.js 16) modern aufgestellt ist, zeigen Backend-Services wie der [playlist_generator](/repo/playlist_generator) und das Dependency-Management Anzeichen von Fragmentierung. Der Gesamtzustand ist **stabil**, erfordert aber Aufmerksamkeit, um technische Schulden abzubauen.

## 2. Portfolio Statistiken
- **Total Repositories:** 57 erkannt.
- **Technologie Stack:**
    - **Frontend:** [Next.js](/tech?q=Next.js), [React](/tech?q=React), [Tailwind CSS](/tech?q=Tailwind), [Tremor](/tech?q=Tremor).
    - **Backend:** [Python](/tech?q=Python) (Flask/FastAPI), [Node.js](/tech?q=Node.js).
    - **Infrastruktur:** [Vercel](/tech?q=Vercel), [Fly.io](/tech?q=Fly.io), [Supabase](/tech?q=Supabase), [Cloudflare](/tech?q=Cloudflare).
- **Deployment Gesundheit:** 31 aktive Deployments erkannt.

## 3. Kritische Risiken
> [!WARNING]
> **Sofortige Maßnahmen erforderlich**

1.  **Veraltete Abhängigkeiten**: Das Repository [playlist_generator](/repo/playlist_generator) wurde seit >180 Tagen nicht aktualisiert. Dies erhöht das Sicherheitsrisiko.
2.  **Secret Management**: Sensible Schlüssel wie \`OPENAI_API_KEY\` wurden in der Analyse gefunden. Nutzen Sie eine zentrale Lösung statt \`.env\` Dateien.
3.  **Sichtbarkeit**: 57 Repos wurden gescannt. Prüfen Sie, ob interne Tools auf \`Private\` gesetzt sind.

## 4. Strategische Empfehlungen (Nächste Schritte)

### Phase 1: Stabilisierung (Wochen 1-2)
-   **CI/CD Standardisierung**: Implementieren Sie die [GitHub Actions](/repo/dashboard) Pipeline für alle Repos, um Linting und Tests bei jedem Push zu erzwingen.
-   **Dependency Audit**: Führen Sie \`npm audit\` aus und beheben Sie kritische Lücken.

### Phase 2: Modernisierung (Wochen 3-6)
-   **Unified API Gateway**: Ein Gateway vor den Python- und Node-Services vereinheitlicht Authentifizierung und [Logs](/logs).
-   **Infrastructure as Code**: Überführen Sie manuelle Konfigurationen in Terraform.

### Phase 3: Automatisierung (Laufend)
-   **Automatisches Reporting**: Dieser Bericht kann wöchentlich generiert werden.
-   **DNS Management**: Prüfen Sie die Einträge im neuen [DNS Dashboard](/dns).
`;

    // Use raw SQL fallback if needed, similar to the API route
    if (!prisma.aIReport) {
        const crypto = require('crypto');
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await prisma.$executeRawUnsafe(
            'INSERT INTO AIReport (id, content, createdAt) VALUES (?, ?, ?)',
            id, reportContent, now
        );
    } else {
        await prisma.aIReport.create({
            data: {
                content: reportContent,
                createdAt: new Date()
            }
        });
    }

    console.log('✅ German Project Overview seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
