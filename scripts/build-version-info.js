const { writeFileSync } = require('fs');
const { logVersionInfo, getVersionInfo } = require('../lib/version.js');

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