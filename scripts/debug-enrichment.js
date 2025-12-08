const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log("Debugging AI Enrichment...");

    // 1. Setup AI Client
    const envPath = path.join(process.cwd(), '.env');
    let fileKey = null;

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/PERPLEXITY_API_KEY=(.*)/) || envContent.match(/PERPLEXITY_API_TOKEN=(.*)/) || envContent.match(/OPENAI_API_KEY=(.*)/);
        if (match && match[1]) {
            fileKey = match[1].trim().replace(/["']/g, '');
        }
    }

    const apiKey = fileKey || process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("❌ API Key not found!");
        return;
    }
    console.log("✅ API Key found.");

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.perplexity.ai",
    });

    // 2. Find kitools
    const repo = await prisma.repository.findFirst({
        where: { name: 'kitools' },
        include: { technologies: true }
    });

    if (!repo) {
        console.error("❌ Repo 'kitools' not found.");
        return;
    }

    console.log(`Found repo: ${repo.name}`);
    console.log(`Current Description: ${repo.description}`);

    const techStack = repo.technologies.map(t => t.name).join(', ');
    const prompt = `
    Erstelle eine sehr kurze, prägnante Beschreibung (max. 1 Satz, Deutsch) für ein Software-Repository.
    Name: ${repo.name}
    Technologien: ${techStack}
    
    Antworte NUR mit der Beschreibung. Keine Anführungszeichen.
    `;

    console.log("Sending prompt to AI...");
    try {
        const completion = await client.chat.completions.create({
            model: "sonar-pro",
            messages: [
                { role: "system", content: "Du bist ein technischer Redakteur." },
                { role: "user", content: prompt }
            ],
            max_tokens: 60,
        });

        const description = completion.choices[0].message.content?.trim() || "Keine Beschreibung verfügbar.";
        console.log(`✅ AI Response: ${description}`);

        // Update DB
        await prisma.repository.update({
            where: { id: repo.id },
            data: { description }
        });
        console.log("✅ Database updated.");

    } catch (e) {
        console.error("❌ AI Error:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
