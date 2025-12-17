#!/usr/bin/env node
/**
 * Bulk Deploy Workflow Templates to Existing Repositories
 * 
 * This script deploys workflow templates to all existing repositories
 * in your account or organization.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DeployOptions {
    owner: string; // GitHub username or organization
    workflows?: string[]; // Specific workflows to deploy (default: all)
    dryRun?: boolean;
    skipRepos?: string[]; // Repositories to skip
}

const AVAILABLE_WORKFLOWS = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

class BulkWorkflowDeployer {
    private options: DeployOptions;
    private templatesDir: string;
    private deployedCount = 0;
    private skippedCount = 0;
    private failedRepos: string[] = [];

    constructor(options: DeployOptions) {
        this.options = options;
        this.templatesDir = path.join(process.cwd(), 'workflow-templates');
    }

    async run(): Promise<void> {
        console.log('🚀 Bulk Workflow Template Deployment');
        console.log(`📦 Owner: ${this.options.owner}`);
        console.log(`🔍 Dry Run: ${this.options.dryRun ? 'Yes' : 'No'}`);
        console.log('');

        try {
            const repos = await this.getRepositories();
            console.log(`📋 Found ${repos.length} repositories\n`);

            for (const repo of repos) {
                await this.deployToRepository(repo);
            }

            this.printSummary();
        } catch (error) {
            console.error('\n❌ Deployment failed:', error);
            process.exit(1);
        }
    }

    private async getRepositories(): Promise<string[]> {
        console.log('🔍 Fetching repositories...');

        try {
            // Get all repos for the owner
            const output = execSync(
                `gh repo list ${this.options.owner} --limit 1000 --json name --jq '.[].name'`,
                { encoding: 'utf-8' }
            );

            const repos = output.trim().split('\n').filter(Boolean);

            // Filter out skipped repos
            return repos.filter(repo => {
                if (this.options.skipRepos?.includes(repo)) {
                    console.log(`  ⏭️  Skipping: ${repo} (in skip list)`);
                    this.skippedCount++;
                    return false;
                }
                return true;
            });
        } catch (error) {
            throw new Error(`Failed to fetch repositories: ${error}`);
        }
    }

    private async deployToRepository(repoName: string): Promise<void> {
        console.log(`\n📦 Processing: ${repoName}`);

        const repoPath = path.join(process.cwd(), '..', repoName);
        const workflowsDir = path.join(repoPath, '.github', 'workflows');

        try {
            // Check if repo exists locally
            if (!fs.existsSync(repoPath)) {
                console.log(`  ⚠️  Repository not found locally, cloning...`);
                if (!this.options.dryRun) {
                    execSync(`gh repo clone ${this.options.owner}/${repoName} ${repoPath}`, {
                        stdio: 'pipe'
                    });
                }
            }

            // Create workflows directory if it doesn't exist
            if (!this.options.dryRun && !fs.existsSync(workflowsDir)) {
                fs.mkdirSync(workflowsDir, { recursive: true });
            }

            // Deploy workflows
            const workflowsToDeploy = this.options.workflows || AVAILABLE_WORKFLOWS;
            let deployedInRepo = 0;

            for (const workflow of workflowsToDeploy) {
                const sourcePath = path.join(this.templatesDir, workflow);
                const targetPath = path.join(workflowsDir, workflow);

                if (!fs.existsSync(sourcePath)) {
                    console.log(`  ⚠️  Template not found: ${workflow}`);
                    continue;
                }

                // Check if workflow already exists
                if (fs.existsSync(targetPath)) {
                    console.log(`  ⏭️  Already exists: ${workflow}`);
                    continue;
                }

                if (this.options.dryRun) {
                    console.log(`  [DRY RUN] Would copy: ${workflow}`);
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                    console.log(`  ✓ Deployed: ${workflow}`);
                }
                deployedInRepo++;
            }

            // Commit and push if any workflows were deployed
            if (deployedInRepo > 0 && !this.options.dryRun) {
                console.log(`  📤 Committing and pushing...`);

                execSync('git add .github/workflows', { cwd: repoPath, stdio: 'pipe' });
                execSync(
                    'git commit -m "chore: add workflow templates from organization\n\nDeployed workflows:\n' +
                    workflowsToDeploy.map(w => `- ${w}`).join('\n') + '"',
                    { cwd: repoPath, stdio: 'pipe' }
                );
                execSync('git push', { cwd: repoPath, stdio: 'pipe' });

                console.log(`  ✓ Pushed to GitHub`);
            }

            this.deployedCount++;
            console.log(`  ✅ Completed: ${repoName}`);

        } catch (error) {
            console.error(`  ❌ Failed: ${error}`);
            this.failedRepos.push(repoName);
        }
    }

    private printSummary(): void {
        console.log('\n' + '='.repeat(60));
        console.log('📊 Deployment Summary');
        console.log('='.repeat(60));
        console.log(`✅ Successfully deployed: ${this.deployedCount}`);
        console.log(`⏭️  Skipped: ${this.skippedCount}`);
        console.log(`❌ Failed: ${this.failedRepos.length}`);

        if (this.failedRepos.length > 0) {
            console.log('\nFailed repositories:');
            this.failedRepos.forEach(repo => console.log(`  - ${repo}`));
        }

        console.log('\n✨ Deployment complete!');
    }
}

// Parse command line arguments
function parseArgs(): DeployOptions {
    const args = process.argv.slice(2);
    const options: Partial<DeployOptions> = {
        skipRepos: ['.github', 'Organisation-Repo'] // Skip template repos
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--owner' && args[i + 1]) {
            options.owner = args[i + 1];
            i++;
        } else if (args[i] === '--workflows' && args[i + 1]) {
            options.workflows = args[i + 1].split(',');
            i++;
        } else if (args[i] === '--dry-run') {
            options.dryRun = true;
        } else if (args[i] === '--skip' && args[i + 1]) {
            options.skipRepos = [...(options.skipRepos || []), ...args[i + 1].split(',')];
            i++;
        }
    }

    if (!options.owner) {
        console.error('❌ Error: --owner is required');
        console.log('');
        console.log('Usage:');
        console.log('  npx tsx scripts/bulk-deploy-workflows.ts --owner <username|org> [options]');
        console.log('');
        console.log('Options:');
        console.log('  --owner <name>        GitHub username or organization (required)');
        console.log('  --workflows <list>    Comma-separated list of workflows to deploy');
        console.log('                        Default: all workflows');
        console.log('  --skip <repos>        Comma-separated list of repos to skip');
        console.log('  --dry-run             Preview changes without applying them');
        console.log('');
        console.log('Examples:');
        console.log('  # Deploy all workflows to all repos (dry run)');
        console.log('  npx tsx scripts/bulk-deploy-workflows.ts --owner skquievreux --dry-run');
        console.log('');
        console.log('  # Deploy only CI and Release workflows');
        console.log('  npx tsx scripts/bulk-deploy-workflows.ts --owner skquievreux --workflows ci.yml,release.yml');
        console.log('');
        console.log('  # Deploy to all repos except specific ones');
        console.log('  npx tsx scripts/bulk-deploy-workflows.ts --owner skquievreux --skip repo1,repo2');
        console.log('');
        process.exit(1);
    }

    return options as DeployOptions;
}

// Main execution
if (require.main === module) {
    const options = parseArgs();
    const deployer = new BulkWorkflowDeployer(options);
    deployer.run().catch(console.error);
}

export { BulkWorkflowDeployer };
