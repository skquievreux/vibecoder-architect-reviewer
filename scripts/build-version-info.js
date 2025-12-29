const { writeFileSync } = require('fs');

// Fallback version info if TS version not available
const getVersionInfo = () => {
  try {
    return require('../lib/version.js').getVersionInfo();
  } catch {
    // Fallback to package.json
    const packageJson = require('../package.json');
    const version = packageJson?.version || 'unknown';
    const nextVersion = packageJson?.dependencies?.next || 'unknown';

    return {
      version,
      nextVersion,
      buildTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      gitCommit: 'dev',
      nodeVersion: process.version,
      platform: process.platform
    };
  }
};

const logVersionInfo = (appName = 'Vibecoder Architect Reviewer') => {
  const versionInfo = getVersionInfo();

  console.log(`\n🏗️  Building ${appName} v${versionInfo.version}`);
  console.log(`📅 Build Time: ${versionInfo.buildTime}`);
  console.log(`📦 Node.js: ${versionInfo.nodeVersion}`);
  console.log(`▲ Next.js: ${versionInfo.nextVersion}`);
  console.log(`🔧 Platform: ${versionInfo.platform}`);
  console.log(`⚡ Environment: ${versionInfo.environment}`);
  console.log(`🔗 Git Commit: ${versionInfo.gitCommit}`);
  console.log('');
};

const appName = 'Vibecoder Architect Reviewer';

// Log version information to console during build
logVersionInfo(appName);

// Create build info file for runtime access
const versionInfo = getVersionInfo();
const buildInfo = {
  ...versionInfo,
  appName,
  buildTime: new Date().toISOString()
};

try {
  writeFileSync('./public/build-info.json', JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info written to public/build-info.json');
} catch (error) {
  console.error('❌ Failed to write build info:', error);
  process.exit(1);
}

console.log('\n🎯 Build Information Summary:');
console.log(`📦 Application: ${appName}`);
console.log(`🔢 Version: ${versionInfo.version}`);
console.log(`⚡ Environment: ${versionInfo.environment}`);
console.log(`🔗 Git Commit: ${versionInfo.gitCommit}`);
console.log(`📅 Build Time: ${versionInfo.buildTime}`);
console.log(`🦕 Node.js: ${versionInfo.nodeVersion}`);
console.log(`🖥 Platform: ${versionInfo.platform}`);
console.log('');