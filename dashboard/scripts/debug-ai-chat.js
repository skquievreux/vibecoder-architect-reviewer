const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Helper to get API Key safely
function getApiKey() {
    const envPath = path.join(__dirname, '../.env');
    let fileKey = null;

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/PERPLEXITY_API_KEY=(.*)/) || envContent.match(/PERPLEXITY_API_TOKEN=(.*)/) || envContent.match(/OPENAI_API_KEY=(.*)/);
        if (match && match[1]) {
            fileKey = match[1].trim().replace(/["']/g, '');
        }
    }

    return fileKey || process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;
}

async function main() {
    const apiKey = getApiKey();
    console.log("API Key found:", apiKey ? "Yes (" + apiKey.substring(0, 5) + "...)" : "No");

    if (!apiKey) {
        console.error("Missing API Key");
        return;
    }

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.perplexity.ai",
    });

    const systemPrompt = "You are a helpful assistant.";
    const history = [
        { role: 'assistant', content: "Hello! I'm your AI Architect Advisor." }
    ];
    const message = "Test message";

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
        { role: "user", content: message }
    ];

    console.log("Sending messages:", JSON.stringify(messages, null, 2));

    try {
        const completion = await client.chat.completions.create({
            model: "sonar-pro",
            messages: messages,
        });

        console.log("Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
