
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function main() {
    const repoName = 'inspect-whisper';
    const repo = await prisma.repository.findFirst({
        where: { name: repoName }
    });

    if (!repo || !repo.description) {
        console.error('Repository or description not found in DB.');
        return;
    }

    console.log(`Syncing description for ${repoName}: "${repo.description}"`);

    const response = await fetch(`https://api.github.com/repos/${repo.nameWithOwner}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            description: repo.description
        })
    });

    if (response.ok) {
        console.log('✅ Successfully updated GitHub description.');
        const data = await response.json();
        console.log('New GitHub Description:', data.description);
    } else {
        console.error('❌ Failed to update GitHub.');
        console.error('Status:', response.status);
        console.error('Response:', await response.text());
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
