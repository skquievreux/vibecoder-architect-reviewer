const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname);
const files = fs.readdirSync(scriptsDir).filter(f => (f.endsWith('.js') || f.endsWith('.ts')) && f !== 'fix-all-env.js');

console.log('🔧 Fixing environment variable loading in all scripts...\n');

let fixed = 0;
let alreadyGood = 0;

for (const file of files) {
    const filePath = path.join(scriptsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // Check if already has proper dotenv setup
    if (content.includes("require('dotenv').config") && content.includes('.env.local')) {
        alreadyGood++;
        continue;
    }

    // Check if file uses environment variables
    if (!content.includes('process.env')) {
        alreadyGood++;
        continue;
    }

    // Find where to insert dotenv
    const lines = content.split('\n');
    let insertIndex = -1;
    let hasPathImport = false;

    // Find first require/import and check for path
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes("require('path')") || line.includes('require("path")')) {
            hasPathImport = true;
        }

        if ((line.startsWith('const ') || line.startsWith('import ')) &&
            (line.includes('require(') || line.includes('from ')) &&
            insertIndex === -1) {
            insertIndex = i + 1;
        }
    }

    if (insertIndex === -1) {
        // No imports found, insert at top
        insertIndex = 0;
    }

    // Add path import if missing
    if (!hasPathImport) {
        lines.splice(insertIndex, 0, "const path = require('path');");
        insertIndex++;
    }

    // Add dotenv config
    lines.splice(insertIndex, 0,
        "require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });",
        "require('dotenv').config({ path: path.join(process.cwd(), '.env') });"
    );

    content = lines.join('\n');

    // Remove old manual env reading if exists
    content = content.replace(/\/\/ Read \.env file[\s\S]*?}\s*}\s*}/gm, '');
    content = content.replace(/const envPath = path\.join\(process\.cwd\(\), '\.env'\);[\s\S]*?}\s*}/gm, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${file}`);
        fixed++;
    } else {
        alreadyGood++;
    }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixed} files`);
console.log(`✓  Already good: ${alreadyGood} files`);
console.log(`📝 Total: ${files.length} files`);
