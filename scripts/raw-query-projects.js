const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: "postgresql://vibecoder:VibeCoder2025Secure!@vibecoder-db-cluster.fly.dev:5432/vibecoder?sslmode=disable"
});

async function main() {
    await client.connect();
    console.log('Connected to DB');

    // Try case-sensitive first
    try {
        const res = await client.query('SELECT name, url, description, "pushedAt", "isPrivate" FROM "Repository" ORDER BY name ASC');
        console.log(`Found ${res.rows.length} projects`);

        let md = `# 📊 Komplette Projekt-Übersicht (Alle ${res.rows.length} Projekte)\n\n`;
        md += `**Stand:** ${new Date().toISOString().split('T')[0]}\n\n`;

        res.rows.forEach((r, i) => {
            md += `## ${i + 1}. ${r.name}\n\n`;
            md += `- **GitHub:** ${r.url}\n`;
            md += `- **Beschreibung:** ${r.description || 'Keine Beschreibung'}\n`;
            md += `- **Letzte Aktivität:** ${r.pushedAt ? new Date(r.pushedAt).toISOString().split('T')[0] : 'Unbekannt'}\n`;
            md += `- **Privat:** ${r.isPrivate ? 'Ja' : 'Nein'}\n`;
            md += `\n---\n\n`;
        });

        fs.writeFileSync('./ALLE_66_PROJEKTE.md', md);
        console.log('✅ Datei erstellt: ALLE_66_PROJEKTE.md');

    } catch (err) {
        console.error('Error with "Repository":', err.message);
        // Try lowercase if uppercase fails
        try {
            const res = await client.query('SELECT name, url, description, pushed_at, is_private FROM repository ORDER BY name ASC');
            // ... same logic if it works ...
        } catch (err2) {
            console.error('Error with repository:', err2.message);
            // List all tables to see what we have
            const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
            console.log('Available tables:', tables.rows.map(t => t.tablename));
        }
    }

    await client.end();
}

main().catch(console.error);
