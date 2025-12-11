#!/usr/bin/env node

/**
 * Quick Setup Script
 * Helps users set up the project quickly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Vibecoder Architect Reviewer - Quick Setup\n');
console.log('='.repeat(60));

// Step 1: Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envLocalPath)) {
    console.log('📝 Step 1: Creating .env.local from .env.example...');

    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envLocalPath);
        console.log('   ✅ .env.local created!');
        console.log('   ⚠️  Please edit .env.local and add your credentials:\n');
        console.log('      - GITHUB_TOKEN (required)');
        console.log('      - GITHUB_OWNER (required)');
        console.log('      - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)');
        console.log('      - AI API Keys (optional)\n');
    } else {
        console.log('   ❌ .env.example not found!');
        process.exit(1);
    }
} else {
    console.log('✅ Step 1: .env.local already exists\n');
}

// Step 2: Check Node.js version
console.log('🔍 Step 2: Checking Node.js version...');
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const versionNumber = parseInt(nodeVersion.replace('v', '').split('.')[0]);

    if (versionNumber >= 20) {
        console.log(`   ✅ Node.js ${nodeVersion} (>= 20.9.0 required)\n`);
    } else {
        console.log(`   ⚠️  Node.js ${nodeVersion} found, but >= 20.9.0 is recommended\n`);
    }
} catch (error) {
    console.log('   ❌ Could not check Node.js version\n');
}

// Step 3: Check Python
console.log('🔍 Step 3: Checking Python installation...');
try {
    const pythonVersion = execSync('python --version', { encoding: 'utf-8' }).trim();
    console.log(`   ✅ ${pythonVersion}\n`);
} catch (error) {
    console.log('   ⚠️  Python not found. Install from: https://www.python.org/downloads/\n');
}

// Step 4: Install Node dependencies
console.log('📦 Step 4: Installing Node.js dependencies...');
console.log('   This may take a few minutes...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ Node.js dependencies installed\n');
} catch (error) {
    console.log('   ❌ Failed to install Node.js dependencies\n');
    process.exit(1);
}

// Step 5: Install Python dependencies
console.log('🐍 Step 5: Installing Python dependencies...');
try {
    execSync('pip install -r analysis/requirements.txt', { stdio: 'inherit' });
    console.log('   ✅ Python dependencies installed\n');
} catch (error) {
    console.log('   ⚠️  Failed to install Python dependencies');
    console.log('   You can install them manually: pip install -r analysis/requirements.txt\n');
}

// Step 6: Generate Prisma Client
console.log('🗄️  Step 6: Generating Prisma Client...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('   ✅ Prisma Client generated\n');
} catch (error) {
    console.log('   ❌ Failed to generate Prisma Client\n');
    process.exit(1);
}

// Step 7: Push database schema
console.log('🗄️  Step 7: Setting up database...');
try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('   ✅ Database schema applied\n');
} catch (error) {
    console.log('   ❌ Failed to set up database\n');
    process.exit(1);
}

// Step 8: Check environment variables
console.log('🔍 Step 8: Checking environment variables...');
try {
    execSync('node check-env.js', { stdio: 'inherit' });
} catch (error) {
    console.log('\n⚠️  Some environment variables are missing.');
    console.log('   Please edit .env.local and add the required values.\n');
}

// Final instructions
console.log('='.repeat(60));
console.log('✅ Setup Complete!\n');
console.log('📋 Next Steps:\n');
console.log('1. Edit .env.local and add your credentials:');
console.log('   - GITHUB_TOKEN: Get from https://github.com/settings/tokens');
console.log('   - GITHUB_OWNER: Your GitHub username or organization\n');
console.log('2. Run the analyzer to fetch repositories:');
console.log('   python analysis/analyzer.py\n');
console.log('3. Seed the database:');
console.log('   npx prisma db seed\n');
console.log('4. Start the development server:');
console.log('   npm run dev\n');
console.log('5. Open http://localhost:3000 in your browser\n');
console.log('📖 For more information, see SETUP.md');
console.log('='.repeat(60));
