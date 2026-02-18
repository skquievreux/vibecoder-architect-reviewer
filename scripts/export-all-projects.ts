import prisma from '../src/lib/prisma';
import fs from 'fs';

async function exportAllProjects() {
    try {
        const repos = await prisma.repository.findMany({
            include: {
                technologies: true,
                deployments: true,
                businessCanvas: true,
            },
            orderBy: {
                name: 'asc'
            }
        });

        console.log(`\n✅ Gefunden: ${repos.length} Projekte\n`);

        let md = `# 📊 Komplette Projekt-Übersicht\n\n`;
        md += `**Total: ${repos.length} Projekte**\n`;
        md += `**Stand:** ${new Date().toISOString().split('T')[0]}\n\n`;
        md += `---\n\n`;

        repos.forEach((r, i) => {
            const techs = r.technologies.map(t => t.name).join(', ');
            const deploys = r.deployments.filter(d => d.url).map(d => d.url);
            const liveUrl = deploys.length > 0 ? deploys[0] : 'Keine';

            md += `## ${i + 1}. ${r.name}\n\n`;
            md += `- **GitHub:** ${r.url}\n`;
            md += `- **Beschreibung:** ${r.description || 'Keine Beschreibung'}\n`;
            md += `- **Tech Stack:** ${techs || 'Nicht erfasst'}\n`;
            md += `- **Live-URL:** ${liveUrl}\n`;
            md += `- **Letzte Aktivität:** ${r.pushedAt ? new Date(r.pushedAt).toISOString().split('T')[0] : 'Unbekannt'}\n`;
            md += `- **Privat:** ${r.isPrivate ? 'Ja' : 'Nein'}\n`;
            md += `\n---\n\n`;
        });

        md += `## 📊 Zusammenfassung\n\n`;
        md += `- **Gesamt-Projekte:** ${repos.length}\n`;
        md += `- **Öffentlich:** ${repos.filter(r => !r.isPrivate).length}\n`;
        md += `- **Privat:** ${repos.filter(r => r.isPrivate).length}\n`;
        md += `- **Mit Deployments:** ${repos.filter(r => r.deployments.length > 0).length}\n`;
        md += `- **Mit Tech Stack:** ${repos.filter(r => r.technologies.length > 0).length}\n`;

        fs.writeFileSync('./ALLE_66_PROJEKTE.md', md);
        console.log('✅ Datei erstellt: ALLE_66_PROJEKTE.md\n');

    } catch (error) {
        console.error('❌ Fehler:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportAllProjects();
