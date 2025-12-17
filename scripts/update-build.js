/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '../package.json');
const buildInfoPath = path.join(__dirname, '../public/build-info.json');

// Read package.json
const packageJson = require(packageJsonPath);

// Increment patch version
const versionParts = packageJson.version.split('.').map(Number);
versionParts[2] += 1;
const newVersion = versionParts.join('.');

packageJson.version = newVersion;

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Updated version to ${newVersion}`);

// Get Git Commit Hash
let commitHash = 'unknown';
try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
    console.warn('Failed to get git commit hash');
}

// Create build-info.json
const buildInfo = {
    version: newVersion,
    buildTime: new Date().toISOString(),
    commitHash: commitHash,
    env: process.env.NODE_ENV || 'development'
};

fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

console.log('Generated public/build-info.json');
