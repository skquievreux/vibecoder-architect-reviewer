/**
 * Version Management Utility (Simplified)
 * 
 * This utility provides centralized version information for the application
 * following Documentation Governance Framework standards.
 * 
 * IMPORTANT: Never hardcode version numbers in components.
 * Always read from package.json (managed by Semantic Release).
 */

export interface VersionInfo {
  /** Current version from package.json */
  version: string;
  /** Build timestamp */
  buildTime: string;
  /** Current environment */
  environment: string;
  /** Git commit hash */
  gitCommit: string;
  /** Node.js version */
  nodeVersion: string;
  /** Platform information */
  platform: string;
}

/**
 * Get version information from package.json
 * This is the single source of truth for version display
 */
export const getVersionInfo = (): VersionInfo => {
  // Use dynamic import to avoid build-time type issues
  const packageJson = eval('require')('../../../package.json');
  const version = packageJson?.version || 'unknown';
  
  const buildTime = new Date().toISOString();
  const environment = typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development';
  const nodeVersion = typeof process !== 'undefined' ? process.version : 'unknown';
  const platform = typeof process !== 'undefined' ? process.platform : 'unknown';
  
  // Simple git commit detection using eval to avoid type issues
  let gitCommit = 'dev';
  try {
    const childProcess = eval('require')('child_process');
    gitCommit = childProcess.execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    // Keep 'dev' as fallback
  }

  return {
    version,
    buildTime,
    environment,
    gitCommit,
    nodeVersion,
    platform
  };
};

/**
 * Log version information to console during build
 * Following Documentation Governance Framework standards
 */
export const logVersionInfo = (appName: string = 'Vibecoder Architect Reviewer'): void => {
  const versionInfo = getVersionInfo();
  
  console.log(`\n🏗️  Building ${appName} v${versionInfo.version}`);
  console.log(`📅 Build Time: ${versionInfo.buildTime}`);
  console.log(`📦 Node.js: ${versionInfo.nodeVersion}`);
  console.log(`🔧 Platform: ${versionInfo.platform}`);
  console.log(`⚡ Environment: ${versionInfo.environment}`);
  console.log(`🔗 Git Commit: ${versionInfo.gitCommit}`);
  console.log('');
};

/**
 * Get version string for display in UI
 * Format: "vX.Y.Z" or "vX.Y.Z (dev)" for development
 */
export const getVersionDisplay = (): string => {
  const { version, environment } = getVersionInfo();
  return environment === 'development' ? `v${version} (dev)` : `v${version}`;
};

/**
 * Get full version information for browser console logging
 * Following Documentation Governance Framework standards
 */
export const getConsoleVersionInfo = (appName: string = 'Vibecoder Architect Reviewer'): string[] => {
  const versionInfo = getVersionInfo();
  
  return [
    `🚀 ${appName} v${versionInfo.version}`,
    `📅 Built: ${versionInfo.buildTime}`,
    `🔗 Commit: ${versionInfo.gitCommit}`,
    `🌐 Environment: ${versionInfo.environment}`,
    `📦 Node.js: ${versionInfo.nodeVersion}`,
    `🔧 Platform: ${versionInfo.platform}`
  ];
};