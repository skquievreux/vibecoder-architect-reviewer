import OpenAI from 'openai';

export interface ChangelogAnalysis {
    providers: Array<{ name: string; confidence: number; reason: string }>;
    interfaces: Array<{ type: string; name: string; direction: string }>;
    envVars: string[];
}

export async function analyzeChangelog(content: string, apiKey: string): Promise<ChangelogAnalysis | null> {
    const isPerplexity = apiKey.startsWith('pplx-');
    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: isPerplexity ? "https://api.perplexity.ai" : undefined,
    });

    const systemPrompt = `
    You are a technical analyst. Analyze the following software changelog.
    
    STRICTLY classify items into these categories:

    1. **PROVIDERS**: ONLY external cloud infrastructure, managed services, or SaaS platforms that host or process data.
       - INCLUDE: AWS, Vercel, Fly.io, Supabase, MongoDB Atlas, S3, R2, Stripe, Lemon Squeezy, Clerk, Auth0, OpenAI (as a service), Perplexity (as a service).
       - EXCLUDE: Client-side libraries (React, Vue.js, Tailwind), Browser APIs (Canvas, Web Audio), Static Assets (Google Fonts), Social Media Platforms (Twitter, Facebook - unless used for Auth).

    2. **INTERFACES**: External APIs or systems the application communicates with, but does not "run on".
       - INCLUDE: Twitter API, Facebook API, WhatsApp API, Google Maps API, Custom Webhooks.
       - NOTE: If a service is both a Provider (e.g. OpenAI) and an Interface (API), classify it as a Provider.

    3. **ENV VARS**: New environment variables introduced.

    Return ONLY a JSON object with this structure:
    {
      "providers": [{ "name": "Service Name", "confidence": 0.0-1.0, "reason": "Why it fits the PROVIDER definition" }],
      "interfaces": [{ "type": "api|database|cloud_service", "name": "Name", "direction": "inbound|outbound" }],
      "envVars": ["VAR_NAME"]
    }
    `;

    try {
        const completion = await client.chat.completions.create({
            model: isPerplexity ? "sonar-pro" : "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this changelog snippet:\n\n${content}` }
            ],
            response_format: isPerplexity ? undefined : { type: "json_object" }
        });

        let result = completion.choices[0].message.content;

        // Robust JSON extraction: Find the first '{' and the last '}'
        if (result) {
            const start = result.indexOf('{');
            const end = result.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                result = result.substring(start, end + 1);
            }
        }

        return result ? JSON.parse(result) : null;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return null;
    }
}
