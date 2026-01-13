import prisma from '../src/lib/prisma';

async function main() {
    console.log('Available models:', Object.keys(prisma).filter(k => typeof prisma[k] === 'object' && prisma[k] !== null && 'findMany' in prisma[k]));
    process.exit(0);
}

main().catch(console.error);
