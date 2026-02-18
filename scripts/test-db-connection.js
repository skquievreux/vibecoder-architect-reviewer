const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
    console.log('Connecting to database...');
    console.log('Using URL:', process.env.DATABASE_URL);
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log('Connected successfully!');
        const userCount = await prisma.user.count();
        console.log('Number of users:', userCount);
        const repoCount = await prisma.repository.count();
        console.log('Number of repositories:', repoCount);

        const admin = await prisma.user.findUnique({
            where: { email: 'admin@example.com' }
        });

        if (admin) {
            console.log('Admin user found. Role:', admin.role);
            console.log('Admin password hash exists:', !!admin.password);
        } else {
            console.log('Admin user NOT found!');
        }
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
