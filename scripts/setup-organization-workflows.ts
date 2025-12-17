#!/usr/bin/env node
/**
 * Setup Organization-Wide GitHub Actions Workflow Templates
 * 
 * This script automates the creation of an organization-level .github repository
 * with standardized workflow templates.
 * 
 * Usage:
 *   npx tsx scripts/setup-organization-workflows.ts --org <organization-name>
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface SetupOptions {
    organizationName: string;
    dryRun?: boolean;
}

const WORKFLOW_TEMPLATES = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

class OrganizationWorkflowSetup {
    private options: SetupOptions;
    private workspaceRoot: string;

    constructor(options: SetupOptions) {
        this.options = options;
        this.workspaceRoot = process.cwd();
    }

    async run(): Promise<void> {
        console.log('🚀 Setting up Organization Workflow Templates');
        console.log(`📦 Organization: ${this.options.organizationName}`);
        console.log(`🔍 Dry Run: ${this.options.dryRun ? 'Yes' : 'No'}\n`);

        try {
            await this.validatePrerequisites();
            await this.createOrganizationRepo();
            await this.copyWorkflowTemplates();
            await this.createReadme();
            await this.commitAndPush();

            console.log('\n✅ Organization workflow templates setup complete!');
            this.printNextSteps();
        } catch (error) {
            console.error('\n❌ Setup failed:', error);
            process.exit(1);
        }
    }

    private async validatePrerequisites(): Promise<void> {
        console.log('🔍 Validating prerequisites...');

        // Check if gh CLI is installed
        try {
            execSync('gh --version', { stdio: 'pipe' });
            console.log('  ✓ GitHub CLI installed');
        } catch {
            throw new Error('GitHub CLI (gh) is not installed. Install from https://cli.github.com/');
        }

        // Check if authenticated
        try {
            execSync('gh auth status', { stdio: 'pipe' });
            console.log('  ✓ GitHub CLI authenticated');
        } catch {
            throw new Error('Not authenticated with GitHub CLI. Run: gh auth login');
        }

        // Check if workflow templates exist
        const templatesDir = path.join(this.workspaceRoot, 'workflow-templates');
        if (!fs.existsSync(templatesDir)) {
            throw new Error(`Workflow templates directory not found: ${templatesDir}`);
        }
        console.log('  ✓ Workflow templates found');
    }

    private async createOrganizationRepo(): Promise<void> {
        console.log('\n📁 Creating organization .github repository...');

        const repoName = `${this.options.organizationName}/.github`;

        if (this.options.dryRun) {
            console.log(`  [DRY RUN] Would create: ${repoName}`);
            return;
        }

        try {
            // Check if repo already exists
            execSync(`gh repo view ${repoName}`, { stdio: 'pipe' });
            console.log(`  ⚠️  Repository ${repoName} already exists, will update it`);
        } catch {
            // Repo doesn't exist, create it
            const createCmd = `gh repo create ${repoName} --public --description "Organization-wide GitHub Actions workflow templates and standards"`;
            execSync(createCmd, { stdio: 'inherit' });
            console.log(`  ✓ Created repository: ${repoName}`);
        }

        // Clone the repository
        const cloneDir = path.join(this.workspaceRoot, 'temp_org_github');
        if (fs.existsSync(cloneDir)) {
            fs.rmSync(cloneDir, { recursive: true, force: true });
        }

        execSync(`gh repo clone ${repoName} ${cloneDir}`, { stdio: 'inherit' });
        console.log(`  ✓ Cloned to: ${cloneDir}`);
    }

    private async copyWorkflowTemplates(): Promise<void> {
        console.log('\n📋 Copying workflow templates...');

        const sourceDir = path.join(this.workspaceRoot, 'workflow-templates');
        const targetDir = path.join(this.workspaceRoot, 'temp_org_github', 'workflow-templates');

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy all .yml and .properties.json files
        const files = fs.readdirSync(sourceDir);
        let copiedCount = 0;

        for (const file of files) {
            if (file.endsWith('.yml') || file.endsWith('.properties.json')) {
                const sourcePath = path.join(sourceDir, file);
                const targetPath = path.join(targetDir, file);

                if (this.options.dryRun) {
                    console.log(`  [DRY RUN] Would copy: ${file}`);
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                    console.log(`  ✓ Copied: ${file}`);
                }
                copiedCount++;
            }
        }

        console.log(`  ✓ Copied ${copiedCount} template files`);
    }

    private async createReadme(): Promise<void> {
        console.log('\n📝 Creating README...');

        const readmeContent = this.generateReadmeContent();
        const readmePath = path.join(this.workspaceRoot, 'temp_org_github', 'README.md');

        if (this.options.dryRun) {
            console.log('  [DRY RUN] Would create README.md');
            return;
        }

        fs.writeFileSync(readmePath, readmeContent);
        console.log('  ✓ Created README.md');
    }

    private generateReadmeContent(): string {
        return `# ${this.options.organizationName} GitHub Actions Templates

This repository contains organization-wide GitHub Actions workflow templates and standards.

## 📋 Available Workflow Templates

### 🔄 CI Pipeline (\`ci.yml\`)
Continuous Integration workflow with linting, building, and verification.

**Required Secrets:** None  
**Triggers:** Push to main/master, Pull Requests

### 📦 Semantic Release (\`release.yml\`)
Automated versioning and changelog generation using semantic-release.

**Required Secrets:**
- \`GH_TOKEN\` - GitHub token with repo write permissions

**Triggers:** Push to main/master

### 🔄 Dashboard Sync (\`dashboard-sync.yml\`)
Automated synchronization of documentation and dashboard metrics.

**Required Secrets:** Project-specific  
**Triggers:** Schedule (daily), Manual dispatch

### 🛡️ Ecosystem Guard (\`ecosystem-guard.yml\`)
Dependency monitoring, security scanning, and ecosystem health checks.

**Required Secrets:** None  
**Triggers:** Schedule (weekly), Pull Requests

### 🚀 Rollout Standards (\`rollout-standards.yml\`)
Deployment governance and rollout quality gates.

**Required Secrets:** Deployment-specific  
**Triggers:** Manual dispatch, Release creation

## 🚀 Using These Templates

### In a New Repository

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. Click "New workflow"
4. Scroll to "Workflows created by ${this.options.organizationName}"
5. Choose a template and click "Configure"

### In an Existing Repository

1. Copy the desired \`.yml\` file from \`workflow-templates/\` to your repo's \`.github/workflows/\` directory
2. Configure any required secrets in your repository settings
3. Commit and push the workflow file

## 🔧 Required Repository Setup

For workflows to function correctly, ensure your repository has:

1. **Node.js Project**: \`package.json\` with required scripts:
   - \`npm run lint\` - Linting
   - \`npm run build\` - Build process
   - \`npm run verify\` - Verification tests

2. **Semantic Release** (if using \`release.yml\`):
   - \`.releaserc.json\` configuration file
   - \`GH_TOKEN\` secret configured

3. **Branch Protection**: Configure branch protection rules for \`main\`/\`master\`

## 📚 Documentation

For detailed information about our CI/CD standards, see:
- [ADR-011: Organization-Wide Workflow Templates](https://github.com/${this.options.organizationName}/vibecoder-architect-reviewer/blob/main/docs/adr/011-organization-workflow-templates.md)

## 🤝 Contributing

To update these templates:

1. Make changes in the source repository
2. Run \`npx tsx scripts/setup-organization-workflows.ts --org ${this.options.organizationName}\`
3. Review and commit the changes
4. Existing repositories will need to manually update their workflows

## 📞 Support

For questions or issues with these workflows, please:
- Open an issue in this repository
- Contact the DevOps team
- Check our internal documentation

---

**Last Updated:** ${new Date().toISOString().split('T')[0]}  
**Maintained by:** ${this.options.organizationName} DevOps Team
`;
    }

    private async commitAndPush(): Promise<void> {
        console.log('\n📤 Committing and pushing changes...');

        const repoDir = path.join(this.workspaceRoot, 'temp_org_github');

        if (this.options.dryRun) {
            console.log('  [DRY RUN] Would commit and push changes');
            return;
        }

        try {
            // Configure git
            execSync('git config user.name "GitHub Actions Setup"', { cwd: repoDir, stdio: 'pipe' });
            execSync('git config user.email "actions@github.com"', { cwd: repoDir, stdio: 'pipe' });

            // Add all files
            execSync('git add .', { cwd: repoDir, stdio: 'pipe' });

            // Check if there are changes to commit
            try {
                execSync('git diff-index --quiet HEAD --', { cwd: repoDir, stdio: 'pipe' });
                console.log('  ℹ️  No changes to commit');
            } catch {
                // There are changes, commit them
                execSync('git commit -m "chore: update workflow templates"', { cwd: repoDir, stdio: 'inherit' });
                execSync('git push', { cwd: repoDir, stdio: 'inherit' });
                console.log('  ✓ Changes committed and pushed');
            }
        } catch (error) {
            throw new Error(`Failed to commit and push: ${error}`);
        }
    }

    private printNextSteps(): void {
        console.log('\n📋 Next Steps:');
        console.log('');
        console.log('1. Visit your organization .github repository:');
        console.log(`   https://github.com/${this.options.organizationName}/.github`);
        console.log('');
        console.log('2. Create a new repository and check the Actions tab');
        console.log('   You should see your custom workflow templates!');
        console.log('');
        console.log('3. Update existing repositories by copying workflows from:');
        console.log(`   https://github.com/${this.options.organizationName}/.github/tree/main/workflow-templates`);
        console.log('');
        console.log('4. Clean up temporary directory:');
        console.log('   rm -rf temp_org_github');
    }
}

// Parse command line arguments
function parseArgs(): SetupOptions {
    const args = process.argv.slice(2);
    const options: Partial<SetupOptions> = {};

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--org' && args[i + 1]) {
            options.organizationName = args[i + 1];
            i++;
        } else if (args[i] === '--dry-run') {
            options.dryRun = true;
        }
    }

    if (!options.organizationName) {
        console.error('❌ Error: --org <organization-name> is required');
        console.log('');
        console.log('Usage:');
        console.log('  npx tsx scripts/setup-organization-workflows.ts --org <organization-name> [--dry-run]');
        console.log('');
        console.log('Example:');
        console.log('  npx tsx scripts/setup-organization-workflows.ts --org skquievreux');
        process.exit(1);
    }

    return options as SetupOptions;
}

// Main execution
if (require.main === module) {
    const options = parseArgs();
    const setup = new OrganizationWorkflowSetup(options);
    setup.run().catch(console.error);
}

export { OrganizationWorkflowSetup };
