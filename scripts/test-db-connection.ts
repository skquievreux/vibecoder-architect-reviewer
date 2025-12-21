
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Testing Database Connection...');
    try {
        const count = await prisma.repository.count();
        console.log(`✅ Connection Successful! Found ${count} repositories.`);
    } catch (error) {
        console.error('❌ Connection Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
