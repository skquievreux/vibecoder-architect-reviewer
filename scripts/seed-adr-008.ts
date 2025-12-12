
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📝 Creating ADR-008: Centralized AI Rate Limiting...");

    const title = "ADR-008: Centralized AI Rate Limiting";

    const adr = await prisma.architectureDecision.upsert({
        where: { title: title },
        update: {
            context: "Frequent '429 Too Many Requests' errors from AI providers (Perplexity/OpenAI) caused by uncoordinated parallel requests from distributed scripts and API routes.",
            decision: "Implement a Centralized AI Gateway (Singleton Client) in `lib/ai/core.ts` that enforces global queuing, sequential execution with 2s delay, and automatic exponential backoff for retries.",
            consequences: "Positive: High reliability for batch jobs (no more crashes), centralized config.\nNegative: Slower execution due to serialization; state is in-memory only (acceptable for current single-instance deployment).",
            status: "ACCEPTED",
            tags: "AI, Architecture, Reliability, Rate-Limit"
        },
        create: {
            title: title,
            status: "ACCEPTED",
            context: "Frequent '429 Too Many Requests' errors from AI providers (Perplexity/OpenAI) caused by uncoordinated parallel requests from distributed scripts and API routes.",
            decision: "Implement a Centralized AI Gateway (Singleton Client) in `lib/ai/core.ts` that enforces global queuing, sequential execution with 2s delay, and automatic exponential backoff for retries.",
            consequences: "Positive: High reliability for batch jobs (no more crashes), centralized config.\nNegative: Slower execution due to serialization; state is in-memory only (acceptable for current single-instance deployment).",
            tags: "AI, Architecture, Reliability, Rate-Limit"
        }
    });

    console.log(`✅ ADR Created/Updated: ${adr.title}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
