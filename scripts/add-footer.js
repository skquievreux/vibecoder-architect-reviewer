#!/usr/bin/env node

/**
 * Add Footer Script
 * 
 * Automates the addition of a standardized Footer component
 * Supports: Next.js (App/Pages Router), Vite/React
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Configuration
const TEMP_DIR = path.join(os.tmpdir(), 'footer-update');
const FOOTER_CONTENT = (appName) => `
export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#1f2937",
        color: "#ffffff",
        padding: "20px 0",
        textAlign: "center",
        marginTop: "auto",
        fontSize: "14px",
        width: "100%",
        zIndex: 50
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          Entwickelt von{" "}
          <a
            href="mailto:quievreux.consulting@gmail.com"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Quievreux Consulting
          </a>
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px", opacity: 0.8 }}>
          © ${new Date().getFullYear()} ${appName}. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
`;

// CLI Arguments
const args = process.argv.slice(2);
const repoName = args[0];

if (!repoName) {
    console.error('❌ Usage: node add-footer.js <repo-name>');
    process.exit(1);
}

console.log(`\n🎨 Adding Footer to: ${repoName}\n`);

// Helper functions
function run(command, options = {}) {
    try {
        return execSync(command, { encoding: 'utf-8', stdio: 'inherit', ...options });
    } catch (error) {
        if (!options.ignoreError) throw error;
        return null;
    }
}

function cleanup(repoPath) {
    if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true });
    }
}

async function main() {
    const repoPath = path.join(TEMP_DIR, repoName);

    try {
        // Setup
        if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
        cleanup(repoPath);

        // Clone
        console.log('📥 Cloning repository...');
        run(`gh repo clone skquievreux/${repoName} ${repoPath}`);

        // Read App Name
        const pkgPath = path.join(repoPath, 'package.json');
        if (!fs.existsSync(pkgPath)) throw new Error('No package.json found');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        // Format app name: "my-app-name" -> "My App Name"
        const appName = pkg.name
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Create Component Directory
        const srcDir = path.join(repoPath, 'src');
        const componentsDir = path.join(srcDir, 'components');
        if (!fs.existsSync(componentsDir)) {
            // Check if 'app' dir exists directly (some Next.js structures)
            if (fs.existsSync(path.join(repoPath, 'app'))) {
                if (!fs.existsSync(path.join(repoPath, 'components'))) {
                    fs.mkdirSync(path.join(repoPath, 'components'), { recursive: true });
                }
            } else {
                fs.mkdirSync(componentsDir, { recursive: true });
            }
        }

        // Determine Footer Path
        let footerPath;
        if (fs.existsSync(componentsDir)) {
            footerPath = path.join(componentsDir, 'Footer.tsx');
        } else {
            footerPath = path.join(repoPath, 'components', 'Footer.tsx');
        }

        // Write Footer Component
        console.log('📝 Creating Footer component...');
        fs.writeFileSync(footerPath, FOOTER_CONTENT(appName));

        // Inject into Layout
        console.log('💉 Injecting into layout...');
        let layoutFile;
        let layoutType; // 'app-router', 'pages-router', 'vite'

        // 1. Next.js App Router
        if (fs.existsSync(path.join(srcDir, 'app', 'layout.tsx'))) {
            layoutFile = path.join(srcDir, 'app', 'layout.tsx');
            layoutType = 'app-router';
        } else if (fs.existsSync(path.join(repoPath, 'app', 'layout.tsx'))) {
            layoutFile = path.join(repoPath, 'app', 'layout.tsx');
            layoutType = 'app-router';
        }
        // 2. Next.js Pages Router
        else if (fs.existsSync(path.join(srcDir, 'pages', '_app.tsx'))) {
            layoutFile = path.join(srcDir, 'pages', '_app.tsx');
            layoutType = 'pages-router';
        }
        // 3. Vite / React
        else if (fs.existsSync(path.join(srcDir, 'App.tsx'))) {
            layoutFile = path.join(srcDir, 'App.tsx');
            layoutType = 'vite';
        }

        if (!layoutFile) {
            console.error('⚠️  Could not find layout file. Skipping injection.');
            return;
        }

        let content = fs.readFileSync(layoutFile, 'utf-8');

        // Check if Footer already exists
        if (content.includes('<Footer') || content.includes('Footer from')) {
            console.log('⚠️  Footer seems to already exist. Skipping injection.');
        } else {
            // Add Import
            const importPath = footerPath.includes('src/components') ? '@/components/Footer' : '../components/Footer';
            // Adjust import based on file structure (simplified)
            const importStmt = `import Footer from '${layoutType === 'vite' ? './components/Footer' : '@/components/Footer'}';\n`;

            if (!content.includes('import Footer')) {
                content = importStmt + content;
            }

            // Add Component
            if (layoutType === 'app-router') {
                // Insert before </body>
                content = content.replace('</body>', '  <Footer />\n      </body>');
            } else if (layoutType === 'pages-router') {
                // Wrap Component
                // This is harder to regex reliably, usually needs manual check
                // For now, appending to end of fragment or div if found
                console.log('⚠️  Pages Router injection is complex. Please verify manually.');
                // Try to find return ( ... )
            } else if (layoutType === 'vite') {
                // Try to insert at end of main div
                if (content.includes('</>')) {
                    content = content.replace('</>', '<Footer />\n    </>');
                } else if (content.includes('</div>')) {
                    // Find the LAST closing div
                    const lastDivIndex = content.lastIndexOf('</div>');
                    content = content.substring(0, lastDivIndex) + '  <Footer />\n    </div>' + content.substring(lastDivIndex + 6);
                }
            }

            fs.writeFileSync(layoutFile, content);
        }

        // Commit & Push
        console.log('💾 Committing changes...');
        run('git checkout -b feature/add-footer', { cwd: repoPath });
        run('git add .', { cwd: repoPath });
        run('git commit -m "feat: add standardized footer component"', { cwd: repoPath });
        run('git push -u origin feature/add-footer', { cwd: repoPath });

        // Create PR
        console.log('🚀 Creating PR...');
        run(`gh pr create --title "feat: Add Standardized Footer" --body "Adds Quievreux Consulting footer to the application." --base main --head feature/add-footer`, { cwd: repoPath });

        console.log('✅ Done!');
        cleanup(repoPath);

    } catch (error) {
        console.error('❌ Failed:', error.message);
        cleanup(repoPath);
    }
}

main();
