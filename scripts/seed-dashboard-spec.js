const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Dashboard OpenAPI Spec...');

    const specPath = path.join(process.cwd(), 'app/api/openapi.json');
    if (!fs.existsSync(specPath)) {
        console.error('❌ openapi.json not found. Run generate-openapi.js first.');
        return;
    }

    const specContent = fs.readFileSync(specPath, 'utf-8');

    // Find dashboard repo
    const repo = await prisma.repository.findFirst({
        where: { name: 'dashboard' }
    });

    if (repo) {
        // Update existing
        await prisma.repository.update({
            where: { id: repo.id },
            data: { apiSpec: specContent }
        });
        console.log(`✅ Updated existing dashboard repo (ID: ${repo.id})`);
    } else {
        // Create new
        const newRepo = await prisma.repository.create({
            data: {
                name: 'dashboard',
                fullName: 'ladmin/dashboard',
                nameWithOwner: 'ladmin/dashboard',
                url: 'http://localhost:3000',
                apiSpec: specContent
            }
        });
        console.log(`✅ Created new dashboard repo (ID: ${newRepo.id})`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
