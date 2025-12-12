
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Fixing ADR Numbering...");

    // Find my incorrect ADR
    const myAdr = await prisma.architectureDecision.findFirst({
        where: { title: "ADR 002: Centralized AI Rate Limiting" }
    });

    if (!myAdr) {
        console.log("⚠️ ADR 'ADR 002: Centralized AI Rate Limiting' not found. Maybe already fixed?");
        return;
    }

    // Determine next number (safe approach)
    // We saw 007 is highest. Let's use 008.
    const newTitle = "ADR-008: Centralized AI Rate Limiting";

    await prisma.architectureDecision.update({
        where: { id: myAdr.id },
        data: { title: newTitle }
    });

    console.log(`✅ Renamed to: ${newTitle}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
