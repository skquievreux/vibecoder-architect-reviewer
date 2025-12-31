
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';

// --- Configuration ---
// These can be tuned via ENV vars
const RATE_LIMIT_DELAY = 1000; // Reduced delay for OpenRouter
const MAX_RETRIES = 3;

// --- Provider Constants ---
const PROVIDERS = {
    perplexity: {
        baseUrl: "https://api.perplexity.ai",
        defaultModel: "sonar-pro",
        envKey: "PERPLEXITY_API_KEY"
    },
    openrouter: {
        baseUrl: "https://openrouter.ai/api/v1",
        defaultModel: "google/gemini-2.0-flash-exp:free", // Good fallback
        envKey: "OPENROUTER_API_KEY"
    }
};

// --- Environment Loading Helper ---
function getEnv(key: string): string | null {
    // 1. Process Env
    if (process.env[key]) return process.env[key]!;

    // 2. Manual Load via dotenv (Fallback)
    try {
        const envLocal = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envLocal)) {
            const envConfig = dotenv.parse(fs.readFileSync(envLocal));
            if (envConfig[key]) return envConfig[key];
        }
        const env = path.join(process.cwd(), '.env');
        if (fs.existsSync(env)) {
            const envConfig = dotenv.parse(fs.readFileSync(env));
            if (envConfig[key]) return envConfig[key];
        }
    } catch (e) { /* ignore */ }
    return null;
}

// --- Singleton Client ---
let clientInstance: OpenAI | null = null;

export function getAIClient(): OpenAI {
    if (clientInstance) return clientInstance;

    // Detect Provider
    const providerName = (getEnv("AI_PROVIDER") || "perplexity").toLowerCase() as keyof typeof PROVIDERS;
    const providerConfig = PROVIDERS[providerName] || PROVIDERS.perplexity;

    const apiKey = getEnv(providerConfig.envKey);

    if (!apiKey) {
        throw new Error(`AI API Key missing for provider '${providerName}'. Please set ${providerConfig.envKey} in .env.local`);
    }

    clientInstance = new OpenAI({
        apiKey: apiKey,
        baseURL: providerConfig.baseUrl,
        defaultHeaders: providerName === 'openrouter' ? {
            "HTTP-Referer": "https://vibecoder.dev", // OpenRouter required headers
            "X-Title": "VibeCoder Architect"
        } : undefined
    });

    console.log(`🤖 AI Client Initialized (${providerName})`);
    return clientInstance;
}

export function getModel(): string {
    const providerName = (getEnv("AI_PROVIDER") || "perplexity").toLowerCase() as keyof typeof PROVIDERS;
    const envModel = getEnv("AI_MODEL");
    if (envModel) return envModel;

    return PROVIDERS[providerName]?.defaultModel || "sonar-pro";
}

// --- Rate Limiting Logic ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple global lock/queue mechanism
// We use a promise chain to ensure strict sequential execution if needed, 
// or a semaphore for concurrency. For Perplexity, sequential + delay is safest to avoid 429.
let requestChain: Promise<any> = Promise.resolve();

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
