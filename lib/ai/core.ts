
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';

// --- Configuration ---
// These can be tuned via ENV vars
const RATE_LIMIT_DELAY = 2000; // 2 seconds explicit delay between requests to be safe
const MAX_RETRIES = 3;

// --- Environment Loading Helper ---
// Ensures we find keys even when running isolated scripts
function getApiKey(): string | null {
    // 1. Standard process.env
    if (process.env.PERPLEXITY_API_KEY) return process.env.PERPLEXITY_API_KEY;
    if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

    console.warn("⚠️ [AI Core] Keys missing in process.env. Attempting manual file load...");

    // 2. Manual Load via dotenv
    try {
        const envLocal = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envLocal)) {
            console.log(`[AI Core] Reading ${envLocal}`);
            const envConfig = dotenv.parse(fs.readFileSync(envLocal));
            if (envConfig.PERPLEXITY_API_KEY) return envConfig.PERPLEXITY_API_KEY;
            if (envConfig.OPENAI_API_KEY) return envConfig.OPENAI_API_KEY;
        } else {
            console.log(`[AI Core] .env.local not found at ${envLocal}`);
        }

        const env = path.join(process.cwd(), '.env');
        if (fs.existsSync(env)) {
            console.log(`[AI Core] Reading ${env}`);
            const envConfig = dotenv.parse(fs.readFileSync(env));
            if (envConfig.PERPLEXITY_API_KEY) return envConfig.PERPLEXITY_API_KEY;
            if (envConfig.OPENAI_API_KEY) return envConfig.OPENAI_API_KEY;
        }
    } catch (e: any) {
        console.error(`[AI Core] Error reading .env files manually: ${e.message}`);
    }
    return null;
}

// --- Singleton Client ---
let clientInstance: OpenAI | null = null;

export function getAIClient(): OpenAI {
    if (clientInstance) return clientInstance;

    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("AI API Key missing. Please set PERPLEXITY_API_KEY in .env.local");
    }

    clientInstance = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.perplexity.ai", // Default to Perplexity
    });

    console.log("🤖 AI Client Initialized (Perplexity)");
    return clientInstance;
}

// --- Rate Limiting Logic ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple global lock/queue mechanism
// We use a promise chain to ensure strict sequential execution if needed, 
// or a semaphore for concurrency. For Perplexity, sequential + delay is safest to avoid 429.
let requestChain = Promise.resolve();

/**
 * Executes an AI completion request with built-in Rate Limiting and Retry logic.
 * This effectively queues all requests globally within this process.
 */
export async function safeCompletion(
    params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
    options: { priority?: 'high' | 'low' } = {}
): Promise<OpenAI.Chat.Completions.ChatCompletion> {

    // Chain the request to the global promise to ensure sequential execution (or throttle)
    // We append to the chain to make them wait for previous ones
    const previousRequest = requestChain;

    const currentRequest = (async () => {
        // Wait for previous to finish (strictly sequential)
        // This might be too slow for high traffic, but solves 429 completely.
        try {
            await previousRequest;
        } catch (e) { /* ignore previous errors */ }

        // Additional delay to respect rate limit interval
        await wait(RATE_LIMIT_DELAY);

        const client = getAIClient();
        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                const result = await client.chat.completions.create(params);
                return result;
            } catch (error: any) {
                if (error.status === 429) {
                    retries++;
                    const backoff = Math.pow(2, retries) * 2000; // 4s, 8s, 16s
                    console.warn(`⚠️ Rate Limit hit (429). Retrying in ${backoff}ms... (Attempt ${retries}/${MAX_RETRIES})`);
                    await wait(backoff);
                } else {
                    throw error; // Other errors mismatch (401, 500 etc)
                }
            }
        }
        throw new Error(`Max retries (${MAX_RETRIES}) exceeded for AI Request.`);
    })();

    // Update the chain head
    requestChain = currentRequest.catch(() => { }); // catch to prevent chain breaking on error
    return currentRequest;
}
