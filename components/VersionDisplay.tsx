'use client';

import { useEffect } from 'react';
import { getVersionInfo, getVersionDisplay, getConsoleVersionInfo } from '@/lib/version';

/**
 * Version Display Component
 * 
 * Displays version information in footer and logs to console
 * Following Documentation Governance Framework standards
 */
export const VersionDisplay = () => {
  const versionInfo = getVersionInfo();

  useEffect(() => {
    // Log version information to browser console
    const consoleVersionInfo = getConsoleVersionInfo();
    consoleVersionInfo.forEach(line => console.log(line));
  }, []);

  return (
    <div
      className="version-info"
      style={{
        fontSize: '0.75rem',
        color: 'var(--muted-foreground)',
        opacity: 0.8,
        textAlign: 'center',
        padding: '0.5rem'
      }}
    >
      <span title={`Next.js: ${versionInfo.nextVersion}\nBuild: ${versionInfo.buildTime}\nCommit: ${versionInfo.gitCommit}\nPlatform: ${versionInfo.platform}`}>
        {getVersionDisplay()}
      </span>
    </div>
  );
};

/**
 * Footer Version Component for Layout Integration
 */
export const FooterVersion = () => {
  const versionInfo = getVersionInfo();

  return (
    <footer
      className="footer-version"
      style={{
        position: 'fixed',
        bottom: '8px',
        right: '8px',
        fontSize: '0.7rem',
        color: 'var(--muted-foreground)',
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '4px 8px',
        fontFamily: 'monospace',
        zIndex: 50,
        opacity: 0.7
      }}
      title={`Version: ${versionInfo.version}\nNext.js: ${versionInfo.nextVersion}\nBuild: ${versionInfo.buildTime}\nCommit: ${versionInfo.gitCommit}\nEnvironment: ${versionInfo.environment}`}
    >
      v{versionInfo.version}
      <span style={{ margin: '0 5px', opacity: 0.4 }}>|</span>
      Next.js {versionInfo.nextVersion?.replace('^', '')}
      {versionInfo.environment === 'development' && <span style={{ color: 'var(--destructive)' }}> (dev)</span>}
    </footer>
  );
};