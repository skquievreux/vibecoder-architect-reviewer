const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const description = "A powerful dashboard for inspecting and managing Whisper audio transcriptions, built with React, TypeScript, and Supabase.";

    const repo = await prisma.repository.findFirst({
        where: { name: 'inspect-whisper' }
    });

    if (!repo) {
        console.error('Repo not found');
        return;
    }

    const updated = await prisma.repository.update({
        where: { id: repo.id },
        data: { description: description }
    });

    console.log(`Updated description for ${updated.name} to: "${updated.description}"`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
