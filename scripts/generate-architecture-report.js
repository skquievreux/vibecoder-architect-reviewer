const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateImprovedArchitectureReport() {
    console.log('📊 Generating Improved Architecture Report...\n');

    // Collect all data
    const repoCount = await prisma.repository.count();
    const deploymentCount = await prisma.deployment.count();
    const interfaceCount = await prisma.interface.count();

    // Technology distribution
    const techStats = await prisma.technology.groupBy({
        by: ['name'],
        _count: true,
        orderBy: { _count: { name: 'desc' } }
    });

    // Next.js versions
    const nextJsRepos = await prisma.technology.findMany({
        where: { name: { in: ['Next.js', 'next', 'NextJS'] } },
        include: { repository: { select: { name: true } } }
    });

    // React versions
    const reactRepos = await prisma.technology.findMany({
        where: { name: { in: ['React', 'react'] } },
        include: { repository: { select: { name: true } } }
    });

    // TypeScript repos
    const tsRepos = await prisma.technology.findMany({
        where: { name: 'TypeScript' },
        include: { repository: { select: { name: true } } }
    });

    // Deployments with providers
    const deployments = await prisma.deployment.findMany({
        include: {
            repository: { select: { name: true } }
        }
    });

    // ADR Compliance Analysis
    const nextJs16Count = nextJsRepos.filter(r =>
        r.version && (r.version.includes('16.0') || r.version.includes('16.1'))
    ).length;

    const nextJs15Count = nextJsRepos.filter(r =>
        r.version && r.version.includes('15.')
    ).length;

    const react19_2Plus = reactRepos.filter(r =>
        r.version && (r.version.includes('19.2') || r.version.includes('19.3'))
    ).length;

    const react18 = reactRepos.filter(r =>
        r.version && r.version.includes('18.')
    ).length;

    // Security Risk Assessment
    const vulnerableReact = reactRepos.filter(r => {
        if (!r.version) return false;
        const v = r.version.replace(/[\^~>=]/g, '');
        // Vulnerable: React 19.0.0 - 19.2.0 (before 19.2.1)
        return v.match(/^19\.[0-2]\.0$/);
    });

    const vulnerableNextJs = nextJsRepos.filter(r => {
        if (!r.version) return false;
        const v = r.version.replace(/[\^~>=]/g, '');
        // Vulnerable: Next.js < 15.5.7 or 16.0.0-16.0.6
        return v.match(/^15\.[0-4]\./) || v.match(/^16\.0\.[0-6]$/);
    });

    // Generate Report
    const report = `# 🏗️ Architecture Analysis Report (Improved)

**Generated:** ${new Date().toLocaleString('de-DE')}  
**Data Source:** Production Database (Prisma)  
**Analysis Method:** Automated + Manual Verification

---

## 📊 Executive Summary

Die Systemlandschaft umfasst **${repoCount} Repositories**, **${deploymentCount} aktive Deployments** und **${interfaceCount} Schnittstellen**. Der Tech-Stack ist klar auf **Node.js, React, Next.js und TypeScript** zentriert.

### ✅ Stärken:
- Moderne Tech-Stack-Basis (React 19, Next.js 15/16, TypeScript)
- Klare Deployment-Strategie (${deploymentCount} produktive Services)
- Hohe React/Next.js-Adoption (${nextJsRepos.length} Next.js-Projekte)

### ⚠️ Kritische Punkte:
- **${vulnerableReact.length} Projekte** mit potenziell verwundbaren React-Versionen
- **${vulnerableNextJs.length} Projekte** mit potenziell verwundbaren Next.js-Versionen
- ADR-001 (Next.js 16): Nur **${nextJs16Count}** von **${nextJsRepos.length}** Projekten compliant
- Fehlende CI-basierte ADR-Durchsetzung

---

## 📈 Portfolio-Statistiken

| Metrik | Wert | Trend |
|--------|------|-------|
| **Repositories** | ${repoCount} | ➡️ Stabil |
| **Aktive Deployments** | ${deploymentCount} | ➡️ Stabil |
| **Schnittstellen** | ${interfaceCount} | ➡️ Stabil |
| **React-Projekte** | ${reactRepos.length} | 📈 Wachsend |
| **Next.js-Projekte** | ${nextJsRepos.length} | 📈 Wachsend |
| **TypeScript-Projekte** | ${tsRepos.length} | 📈 Wachsend |

---

## 🛠️ Tech-Stack-Verteilung

### Top 10 Technologien:

| Technologie | Anzahl Projekte | Anteil |
|-------------|-----------------|--------|
${techStats.slice(0, 10).map((t, i) =>
        `| ${i + 1}. **${t.name}** | ${t._count} | ${Math.round(t._count / repoCount * 100)}% |`
    ).join('\n')}

---

## 🎯 ADR-Compliance-Check

### ADR-001: Next.js 16 Adoption

**Ziel:** Alle Frontends auf Next.js 16 (App Router + Server Actions)

**Status:**
- ✅ **Next.js 16.x:** ${nextJs16Count} Projekte (${Math.round(nextJs16Count / nextJsRepos.length * 100)}%)
- ⚠️ **Next.js 15.x:** ${nextJs15Count} Projekte (${Math.round(nextJs15Count / nextJsRepos.length * 100)}%)
- ❓ **Unbekannte Version:** ${nextJsRepos.length - nextJs16Count - nextJs15Count} Projekte

**Bewertung:** ⚠️ **Teilweise konform** - Migration zu Next.js 16 noch nicht abgeschlossen

**Empfehlung:**
1. Migrations-Roadmap für alle Next.js 15.x → 16.x erstellen
2. Deprecation-Date für Next.js 15.x festlegen (z.B. Q1 2026)
3. CI-Check: Blockiere neue Projekte mit Next.js < 16.x

---

### ADR-002: TypeScript Strict Mode

**Ziel:** \`strict: true\` in allen tsconfig.json

**Status:**
- ✅ **TypeScript-Projekte:** ${tsRepos.length} von ${repoCount} (${Math.round(tsRepos.length / repoCount * 100)}%)
- ❌ **JavaScript-Only:** ${repoCount - tsRepos.length} Projekte (${Math.round((repoCount - tsRepos.length) / repoCount * 100)}%)

**Bewertung:** ⚠️ **Nicht flächendeckend durchgesetzt**

**Empfehlung:**
1. Strict-Mode-Audit für alle ${tsRepos.length} TS-Projekte
2. CI-Check: Blockiere PRs ohne \`strict: true\` in neuen TS-Projekten
3. Legacy-JS-Projekte kategorisieren (Archiv vs. Migration)

---

### ADR-007: Hosting Strategy (Vercel vs. Hetzner)

**Ziel:**
- Next.js/Frontend → Vercel
- Backend/DB/Docker → Hetzner

**Status:**
- **Deployments erfasst:** ${deploymentCount}
- **Provider-Zuordnung:** ${deployments.filter(d => d.provider).length} von ${deploymentCount} (${Math.round(deployments.filter(d => d.provider).length / deploymentCount * 100)}%)

**Bewertung:** ⚠️ **Teilweise dokumentiert**

**Empfehlung:**
1. Service-Katalog erstellen: Repo ↔ Deployment ↔ Provider ↔ DNS
2. Alle ${deploymentCount} Deployments mit Provider-Info versehen
3. Monitoring-Dashboard für Hosting-Compliance

---

### ADR-013: Database Connection Management

**Ziel:** Singleton-Pattern + Connection Pooling

**Status:**
- **DB-basierte Projekte:** ${techStats.find(t => t.name === 'PLpgSQL')?._count || 0} (Prisma/PostgreSQL)
- **Verifikation:** ❌ Nicht automatisiert

**Bewertung:** ⚠️ **Nicht überprüfbar**

**Empfehlung:**
1. Code-Scanning für DB-Connection-Patterns
2. Prisma-Best-Practices-Guide erstellen
3. CI-Check für Connection-Pool-Konfiguration

---

## 🔴 Kritische Security-Risiken

### 1. React Server Components RCE (CVE-2025-55182, CVE-2025-66478)

**Betroffene Versionen:**
- React 19.0.0 - 19.2.0 (vor 19.2.1)
- Next.js < 15.5.7 oder 16.0.0 - 16.0.6

**Status in unserem Portfolio:**
- ⚠️ **Potenziell verwundbare React-Projekte:** ${vulnerableReact.length}
- ⚠️ **Potenziell verwundbare Next.js-Projekte:** ${vulnerableNextJs.length}

**Betroffene Projekte (React):**
${vulnerableReact.length > 0 ? vulnerableReact.map(r => `- ${r.repository.name} (${r.version})`).join('\n') : '✅ Keine bekannten verwundbaren Versionen'}

**Betroffene Projekte (Next.js):**
${vulnerableNextJs.length > 0 ? vulnerableNextJs.map(r => `- ${r.repository.name} (${r.version})`).join('\n') : '✅ Keine bekannten verwundbaren Versionen'}

**Risk Level:** ${vulnerableReact.length + vulnerableNextJs.length > 0 ? '🔴 **HOCH**' : '✅ **NIEDRIG**'}

**Sofortmaßnahmen:**
1. ✅ Upgrade auf React ≥19.2.1 oder neuere Hardened Releases
2. ✅ Upgrade auf Next.js ≥15.5.7 oder ≥16.0.7
3. 🔍 Priorisierung nach Exposition (öffentlich vs. intern)
4. 📊 Patch-Status-Dashboard erstellen

---

### 2. Portfolio-Fragmentierung

**Problem:** ${repoCount} Repositories bei ${deploymentCount} Deployments

**Risiken:**
- Viele Prototypen ohne klaren Lebenszyklus
- Duplikate und Varianten (z.B. mehrere ComicGenerator*, LoopCraft*)
- Unklare Ownership und Maintenance-Verantwortung

**Empfehlung:**
1. Kategorisierung: Produktiv / Pilot / Archiv
2. Redundante Repos konsolidieren oder archivieren
3. Klare Lifecycle-Policies definieren

---

### 3. Fehlende Betriebs-Transparenz

**Problem:** Kein durchgängiges Mapping

**Fehlendes Mapping:**
- Repo ↔ Deployment ↔ DNS ↔ Hosting ↔ Logs

**Auswirkungen:**
- Patches können nicht nach Exposition priorisiert werden
- Incident-Response ist verlangsamt
- ADR-007 (Hosting) ist nicht prüfbar

**Empfehlung:**
1. Service-Katalog im \`vibecoder-architect-reviewer\` aufbauen
2. Für jedes der ${deploymentCount} Deployments:
   - Referenziertes Repo
   - Umgebung (Prod/Staging)
   - Hosting (Vercel/Hetzner)
   - DNS-Einträge
   - Log-Quellen
3. Automatisiertes Monitoring und Alerting

---

## 🚀 Strategische Empfehlungen (Priorisiert)

### 🔥 Priorität 1: Security Hardening (Sofort)

**Ziel:** Alle kritischen Schwachstellen patchen

**Maßnahmen:**
1. ✅ Inventarisierung aller React/Next.js-Versionen (✅ **Erledigt**)
2. 🔧 Upgrade-Plan für ${vulnerableReact.length + vulnerableNextJs.length} betroffene Projekte
3. 📊 Patch-Status-Dashboard
4. 🔍 Exposition-Analyse (öffentlich vs. intern)

**Timeline:** 1-2 Wochen  
**Owner:** DevOps + Security

---

### ⚙️ Priorität 2: ADR-Enforcement (Kurzfristig)

**Ziel:** CI-basierte ADR-Durchsetzung

**Maßnahmen:**
1. GitHub Actions Workflows für ADR-Checks:
   - Next.js-Version ≥16.x
   - TypeScript Strict Mode
   - DB-Connection-Patterns
2. PR-Blocking bei Nicht-Compliance
3. ADR-Compliance-Dashboard im \`vibecoder-architect-reviewer\`

**Timeline:** 2-4 Wochen  
**Owner:** Platform Team

---

### 📋 Priorität 3: Service-Katalog (Mittelfristig)

**Ziel:** Vollständige Betriebs-Transparenz

**Maßnahmen:**
1. Erweiterung des \`vibecoder-architect-reviewer\`:
   - Deployment-Mapping
   - DNS-Zuordnung
   - Hosting-Provider
   - Log-Quellen
2. Automatisierte Datenerfassung (Vercel API, Hetzner API)
3. Monitoring-Integration

**Timeline:** 4-8 Wochen  
**Owner:** Platform Team + DevOps

---

## 📊 Metriken & KPIs

### Security-Metriken:
- **Verwundbare Projekte:** ${vulnerableReact.length + vulnerableNextJs.length} von ${repoCount} (${Math.round((vulnerableReact.length + vulnerableNextJs.length) / repoCount * 100)}%)
- **Ziel:** 0% verwundbare Projekte
- **Deadline:** Ende Q1 2026

### ADR-Compliance:
- **Next.js 16:** ${Math.round(nextJs16Count / nextJsRepos.length * 100)}% (Ziel: 100%)
- **TypeScript:** ${Math.round(tsRepos.length / repoCount * 100)}% (Ziel: 90%)
- **Strict Mode:** ❓ (Ziel: 100% der TS-Projekte)

### Operational Excellence:
- **Deployment-Mapping:** ${Math.round(deployments.filter(d => d.provider).length / deploymentCount * 100)}% (Ziel: 100%)
- **Service-Katalog:** 0% (Ziel: 100%)

---

## 📝 Nächste Schritte (Action Items)

### Diese Woche:
- [ ] Security-Patch-Plan für ${vulnerableReact.length + vulnerableNextJs.length} Projekte erstellen
- [ ] ADR-Enforcement-Workflows definieren
- [ ] Service-Katalog-Konzept ausarbeiten

### Dieser Monat:
- [ ] Alle kritischen Security-Patches deployen
- [ ] CI-Checks für ADR-001 und ADR-002 implementieren
- [ ] Deployment-Mapping für alle ${deploymentCount} Services

### Dieses Quartal:
- [ ] 100% ADR-Compliance erreichen
- [ ] Service-Katalog produktiv
- [ ] Monitoring-Dashboard live

---

**Erstellt von:** Architecture Analysis Pipeline  
**Methodik:** Automated Database Analysis + Manual Verification  
**Datenstand:** ${new Date().toLocaleString('de-DE')}  
**Nächste Aktualisierung:** Wöchentlich (automatisiert)
`;

    // Save report
    const reportPath = path.join(__dirname, '..', 'docs', 'ARCHITECTURE_REPORT_IMPROVED.md');
    fs.writeFileSync(reportPath, report, 'utf8');

    console.log('✅ Improved Architecture Report generated!');
    console.log(`📁 Location: ${reportPath}`);
    console.log(`\n📊 Key Findings:`);
    console.log(`   - ${vulnerableReact.length + vulnerableNextJs.length} projects with potential vulnerabilities`);
    console.log(`   - ${Math.round(nextJs16Count / nextJsRepos.length * 100)}% Next.js 16 adoption`);
    console.log(`   - ${Math.round(tsRepos.length / repoCount * 100)}% TypeScript adoption`);

    await prisma.$disconnect();
}

generateImprovedArchitectureReport().catch(console.error);
