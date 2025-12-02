import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const repos = await prisma.repository.findMany();
    const found = repos.find(r => r.name.toLowerCase().includes('acid-monk'));
    console.log(found ? `Found: ${found.name}` : 'Not Found');
}
main().finally(() => prisma.$disconnect());
