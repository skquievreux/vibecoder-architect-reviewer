
import fs from 'fs';
import path from 'path';
import { safeCompletion } from '../../lib/ai/core';

// Configuration
const RAW_DIR = path.join(process.cwd(), 'data', 'intelligence', 'raw');
const ANALYZED_DIR = path.join(process.cwd(), 'data', 'intelligence', 'analyzed');

if (!fs.existsSync(ANALYZED_DIR)) {
    fs.mkdirSync(ANALYZED_DIR, { recursive: true });
}

async function analyzeRepo(filePath: string) {
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { name, content } = rawData;
    const readme = content.readme || "No README provided.";
    const packageInfo = content.packageJson ? JSON.stringify(content.packageJson, null, 2) : "No package.json";

    console.log(`🤖 Analyzing ${name}...`);

    const systemPrompt = `You are a Senior Product Manager auditing a software portfolio.
  Your goal is to extract BUSINESS VALUE from technical documentation.
  Ignorance of specific implementation details is fine; focus on "What problem does this solve?" and "Who pays for it?".
  
  You must output a STRICT JSON object (no markdown, no extra text, no surrounding backticks) with this schema:
  {
    "description": "A powerful 2-sentence marketing pitch.",
    "businessCanvas": {
        "valueProposition": ["Point 1", "Point 2", "Point 3"],
        "customerSegments": [{"name": "Target Audience", "willingness_to_pay": "High/Medium/Low", "pain_points": ["Pain 1", "Pain 2"]}],
        "revenueStreams": [{"source": "e.g. SaaS Subscription", "model": "Recurring", "potential_arr": 10000}]
    }
  }`;

    const userPrompt = `Repository Name: ${name}
  
  CONTEXT (README):
  ${readme.slice(0, 8000)} ${readme.length > 8000 ? '...(truncated)' : ''}
  
  CONTEXT (package.json):
  ${packageInfo.slice(0, 2000)}
  
  Generate the Business Profile JSON.`;

    try {
        const response = await safeCompletion({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: "sonar-pro", // Valid Perplexity model
        });

        let result = response.choices[0].message.content || "";

        // Clean up markdown code blocks if present (robust parsing)
        result = result.replace(/```json\n?/g, '').replace(/```/g, '').trim();

        if (!result) throw new Error("Empty response from AI");

        const analysis = JSON.parse(result);

        // Save
        fs.writeFileSync(
            path.join(ANALYZED_DIR, `${name}.json`),
            JSON.stringify({ ...rawData, analysis }, null, 2)
        );
        console.log(`✅ Analyzed ${name}`);

    } catch (error) {
        console.error(`❌ Failed to analyze ${name}:`, error instanceof Error ? error.message : String(error));
    }
}

async function main() {
    const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} repositories to analyze.`);

    // Sequential execution to respect rate limits in core.ts
    for (const file of files) {
        // Check if already analyzed to allow restartability
        if (fs.existsSync(path.join(ANALYZED_DIR, file))) {
            console.log(`⏭️ Skipping ${file} (already analyzed)`);
            continue;
        }
        await analyzeRepo(path.join(RAW_DIR, file));
    }

    console.log("🎉 Analysis Complete!");
}

main().catch(console.error);
