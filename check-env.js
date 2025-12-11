#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Checks if all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const REQUIRED_VARS = [
    'DATABASE_URL',
    'GITHUB_TOKEN',
    'GITHUB_OWNER',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
];

const OPTIONAL_VARS = [
    'PERPLEXITY_API_KEY',
    'PERPLEXITY_API_TOKEN',
    'OPENAI_API_KEY',
    'CLOUDFLARE_API_TOKEN',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('🔍 Checking Environment Variables...\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envLocalPath) && !fs.existsSync(envPath)) {
    console.log('❌ No .env.local or .env file found!');
    console.log('📝 Please copy .env.example to .env.local and configure it.');
    console.log('   Command: cp .env.example .env.local\n');
    process.exit(1);
}

console.log(`✅ Environment file found: ${fs.existsSync(envLocalPath) ? '.env.local' : '.env'}\n`);

// Check required variables
console.log('📋 Required Variables:');
let missingRequired = [];

REQUIRED_VARS.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && value !== '' && !value.includes('your_') && !value.includes('_here');

    if (isSet) {
        // Mask sensitive values
        const maskedValue = varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('KEY')
            ? '***' + value.slice(-4)
            : value.length > 50
                ? value.slice(0, 47) + '...'
                : value;
        console.log(`  ✅ ${varName}: ${maskedValue}`);
    } else {
        console.log(`  ❌ ${varName}: NOT SET`);
        missingRequired.push(varName);
    }
});

// Check optional variables
console.log('\n🔧 Optional Variables:');
let setOptional = [];

OPTIONAL_VARS.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && value !== '' && !value.includes('your_') && !value.includes('_here');

    if (isSet) {
        const maskedValue = varName.includes('SECRET') || varName.includes('TOKEN') || varName.includes('KEY')
            ? '***' + value.slice(-4)
            : value.length > 50
                ? value.slice(0, 47) + '...'
                : value;
        console.log(`  ✅ ${varName}: ${maskedValue}`);
        setOptional.push(varName);
    } else {
        console.log(`  ⚪ ${varName}: Not set (optional)`);
    }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));

if (missingRequired.length === 0) {
    console.log('✅ All required variables are set!');
} else {
    console.log(`❌ Missing ${missingRequired.length} required variable(s):`);
    missingRequired.forEach(varName => {
        console.log(`   - ${varName}`);
    });
}

if (setOptional.length > 0) {
    console.log(`✅ ${setOptional.length} optional variable(s) configured`);
}

console.log('='.repeat(60));

// Exit with error if required vars are missing
if (missingRequired.length > 0) {
    console.log('\n❌ Please configure the missing variables in .env.local');
    console.log('📖 See .env.example for reference\n');
    process.exit(1);
} else {
    console.log('\n✅ Environment configuration is valid!\n');
    process.exit(0);
}
