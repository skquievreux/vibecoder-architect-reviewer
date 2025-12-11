const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname);
const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));

console.log('🔍 Scanning scripts for environment variable issues...\n');

let fixed = 0;
let skipped = 0;

for (const file of files) {
    const filePath = path.join(scriptsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip this fix script itself
    if (file === 'fix-env-loading.js') {
        continue;
    }

    // Check if file needs fixing
    const needsFix = (
        // Has manual .env reading
        (content.includes('readFileSync') && content.includes('.env')) ||
        // Has process.env but no dotenv
        (content.includes('process.env') && !content.includes('dotenv'))
    );

    if (!needsFix) {
        skipped++;
        continue;
    }

    let modified = false;

    // Add dotenv if missing
    if (content.includes('process.env') && !content.includes('dotenv')) {
        // Check if it's a TypeScript file
        const isTS = file.endsWith('.ts');

        // Find the first require/import statement
        const lines = content.split('\n');
        let insertIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('require(') || lines[i].includes('import ')) {
                insertIndex = i + 1;
                break;
            }
        }

        // Add dotenv config
        const dotenvLines = [
            "require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });",
            "require('dotenv').config({ path: path.join(process.cwd(), '.env') });"
        ];

        lines.splice(insertIndex, 0, ...dotenvLines);
        content = lines.join('\n');
        modified = true;
    }

    // Remove manual .env reading patterns
    if (content.includes('readFileSync') && content.includes('.env')) {
        // Pattern 1: const envPath = path.join(process.cwd(), '.env');
        content = content.replace(/const\s+envPath\s*=\s*path\.join\(process\.cwd\(\),\s*['"]\.env['"]\);?\s*/g, '');

        // Pattern 2: if (fs.existsSync(envPath)) { ... }
        content = content.replace(/if\s*\(fs\.existsSync\(envPath\)\)\s*\{[\s\S]*?\}/gm, '');

        // Pattern 3: fs.readFileSync(envPath, 'utf-8')
        content = content.replace(/fs\.readFileSync\(envPath,\s*['"]utf-8['"]\)/g, '');

        // Pattern 4: envContent.match(/VARIABLE=(.*)/)
        content = content.replace(/envContent\.match\([^)]+\)/g, '');

        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed: ${file}`);
        fixed++;
    } else {
        skipped++;
    }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Fixed: ${fixed} files`);
console.log(`⏭️  Skipped: ${skipped} files`);
console.log(`\n💡 Note: Manual review recommended for complex cases`);
