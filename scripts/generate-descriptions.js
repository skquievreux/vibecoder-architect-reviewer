
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

const DELAY_MS = 1000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateDescription(name, techs, context) {
    const prompt = `Erstelle eine kurze, professionelle deutsche Beschreibung (maximal 1 Satz) für ein GitHub-Repository namens '${name}'.
    Technologien: ${techs}.
    Kontext: ${context}.
    Antworte NUR mit der Beschreibung, ohne Anführungszeichen oder Einleitung.`;

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    { role: 'system', content: 'Du bist ein technischer Redakteur für Software-Dokumentation.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error(`Error generating description for ${name}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('Starting AI description generation...');

    // Load analysis data for context
    const jsonPath = path.join(process.cwd(), '..', 'analysis_results.json');
    const analysisData = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : [];

    // Find repos with empty descriptions
    const repos = await prisma.repository.findMany({
        where: {
            OR: [
                { description: '' },
                { description: null }
            ]
        },
        include: { technologies: true }
    });

    console.log(`Found ${repos.length} repositories missing descriptions.`);

    let successCount = 0;

    for (const repo of repos) {
        console.log(`Processing ${repo.name}...`);

        // Find extra context from analysis data
        const analysisItem = analysisData.find(item => item.repo.name === repo.name);
        const fileContext = analysisItem ?
            analysisItem.repo.languages.map(l => l.node.name).join(', ') : 'Unknown structure';

        const techList = repo.technologies.map(t => t.name).join(', ');

        const newDescription = await generateDescription(repo.name, techList, fileContext);

        if (newDescription) {
            await prisma.repository.update({
                where: { id: repo.id },
                data: { description: newDescription }
            });
            console.log(`✅ Generated: "${newDescription}"`);
            successCount++;
        }

        await sleep(DELAY_MS);
    }

    console.log(`Generation complete. Updated ${successCount} repositories.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
