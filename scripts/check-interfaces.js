const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const interfaces = await prisma.interface.findMany({
        include: {
            repository: {
                select: {
                    name: true
                }
            }
        },
        take: 20
    });

    console.log('Sample Interfaces:\n');
    interfaces.forEach(iface => {
        console.log(`Repo: ${iface.repository.name}`);
        console.log(`Type: ${iface.type}`);
        console.log(`Direction: ${iface.direction}`);
        console.log(`Details: ${iface.details}`);
        console.log('---\n');
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
