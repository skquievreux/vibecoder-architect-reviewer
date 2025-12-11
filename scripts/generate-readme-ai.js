require('dotenv').config();
const fs = require('fs');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateReadme(repoPath) {
    const pkgPath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const files = fs.readdirSync(repoPath).filter(f => !f.startsWith('.'));

    const prompt = `
    Create a professional README.md for a project with the following details:
    Name: ${pkg.name}
    Description: ${pkg.description || 'No description provided'}
    Dependencies: ${Object.keys(pkg.dependencies || {}).join(', ')}
    Files: ${files.join(', ')}

    Structure:
    # ${pkg.name}
    [Short Description]
    
    ## Features
    - [Feature 1 based on dependencies]
    - [Feature 2]

    ## Tech Stack
    - Node.js
    - [List major libs]

    ## Getting Started
    \`\`\`bash
    npm install
    npm run dev
    \`\`\`

    Language: English (Professional)
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
        });

        const readmeContent = completion.choices[0].message.content;
        fs.writeFileSync(path.join(repoPath, 'README.md'), readmeContent);
        console.log(`✅ Generated README.md for ${pkg.name}`);
    } catch (error) {
        console.error("Failed to generate README:", error);
    }
}

// Example usage: node scripts/generate-readme-ai.js ./
if (require.main === module) {
    const target = process.argv[2] || process.cwd();
    generateReadme(target);
}
