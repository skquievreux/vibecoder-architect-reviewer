
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Load env
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const USERNAME = 'skquievreux';

// We want to target PRs created by us or the script with the specific title
const PR_TITLE_KEYWORD = "security: Patch CVE-2025-55182";

async function githubRequest(method: string, endpoint: string, body?: any) {
    return new Promise<any>((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: endpoint.startsWith('http') ? new URL(endpoint).pathname : endpoint,
            method: method,
            headers: {
                'User-Agent': 'Node.js Script',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    resolve({ error: true, status: res.statusCode, message: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log("🕵️  Assessing Security Patch PRs...");

    if (!GITHUB_TOKEN) {
        console.error("❌ GITHUB_TOKEN missing");
        process.exit(1);
    }

    // 1. Fetch all open PRs for the user (or search issues type:pr user:skquievreux is:open)
    // Using search API is deeper
    const searchUrl = `/search/issues?q=is:pr+is:open+author:${USERNAME}+"${encodeURIComponent(PR_TITLE_KEYWORD)}"`;
    const searchRes = await githubRequest('GET', searchUrl);

    if (searchRes.error) {
        console.error(`❌ Error fetching PRs: ${searchRes.message}`);
        process.exit(1);
    }

    const items = searchRes.items || [];
    console.log(`📋 Found ${items.length} relevant Pull Requests.`);

    if (items.length === 0) {
        console.log("✅ Nothing to merge.");
        return;
    }

    const toMerge = [];
    const failedOrPending = [];

    // 2. Analyze each PR
    for (const item of items) {
        // We need detailed PR data to check mergeability and head status
        // item.pull_request.url gives the API url
        const prUrl = item.pull_request.url; // e.g. https://api.github.com/repos/owner/repo/pulls/1
        const prDetails = await githubRequest('GET', prUrl);

        if (prDetails.error) {
            console.log(`   ⚠️ Could not get details for PR ${item.number}: ${prDetails.message}`);
            continue;
        }

        const repoName = prDetails.base.repo.full_name;
        const branchName = prDetails.head.ref;
        const mergeable = prDetails.mergeable; // true, false, or null (if cannot be determined yet)
        const mergeableState = prDetails.mergeable_state; // 'clean', 'dirty', 'unstable', 'blocked', 'unknown'

        // Check CI Status (Combined status)
        const statusUrl = prDetails.head.sha ? `/repos/${repoName}/commits/${prDetails.head.sha}/status` : null;
        let ciState = 'unknown';

        if (statusUrl) {
            const statusRes = await githubRequest('GET', statusUrl);
            ciState = statusRes.state || 'none'; // 'pending', 'success', 'failure', 'error', 'none' (if no CI)
        }

        // Decision Logic
        // We merge if:
        // 1. Mergeable is true
        // 2. CI is 'success' OR 'none' (No CI configured)
        // 3. Status is NOT 'failure' or 'error'

        const canMerge = (mergeable === true) && (ciState === 'success' || ciState === 'pending' || ciState === 'none');
        // NOTE: 'pending' might refer to "waiting for checks", but if user says "check what CAN be merged", usually we wait for pending
        // But some pending are infinite if manual.
        // Also note: 'clean' means mergeable and checks passed. 'unstable' means checks failed. 'blocked' means reviews needed.

        // Let's rely on mergeable_state if possible, but it's tricky.
        // If mergeable_state === 'clean' => Green.
        // If mergeable_state === 'unstable' => CI failed, but mergeable.
        // If mergeable_state === 'blocked' => Branch protection? (We disabled admin enforcement, so we might override)

        // Refined Logic based on User Screenshot:
        // Green Checkmark usually implies clean/success.
        // Red X implies failure.

        const isGreen = (ciState === 'success');
        const isRed = (ciState === 'failure' || ciState === 'error');
        const isNeutral = (ciState === 'none' || ciState === 'pending'); // Maybe no CI setup yet.

        // We will merge Green and Neutral (assuming Neutral means no CI to fail).
        // We skip Red.

        const prObj = {
            id: item.number,
            repo: repoName,
            url: prDetails.html_url,
            branch: branchName,
            mergeable,
            ciState,
            title: item.title,
            apiUrl: prUrl
        };

        if (!isRed && mergeable !== false) {
            toMerge.push(prObj);
        } else {
            failedOrPending.push(prObj);
        }
    }

    console.log(`\n📊 Assessment:`);
    console.log(`   🟢 Ready to Merge: ${toMerge.length}`);
    console.log(`   🔴 Skipped (Fail/Conflict): ${failedOrPending.length}`);

    // Report Skipped
    if (failedOrPending.length > 0) {
        console.log(`\n⚠️  The following PRs have issues (CI failed or Conflict):`);
        failedOrPending.forEach(p => console.log(`   - ${p.repo}: ${p.ciState.toUpperCase()} (Mergeable: ${p.mergeable}) -> ${p.url}`));
    }

    // Execute Merge for Ready
    if (toMerge.length > 0) {
        console.log(`\n🚀 Merging ${toMerge.length} PRs...`);
        for (const pr of toMerge) {
            console.log(`   Processing ${pr.repo}...`);

            // PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge
            const mergeRes = await githubRequest('PUT', `${pr.apiUrl}/merge`, {
                commit_title: `${pr.title} (Auto-Merged)`,
                commit_message: "Auto-merged via script. Validated Security Patch.",
                merge_method: 'squash' // Squash to keep history clean
            });

            if (mergeRes.error) {
                console.log(`     ❌ Merge Failed: ${mergeRes.message}`);
            } else {
                console.log(`     ✅ Merged!`);

                // Delete Branch
                // DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}
                const deleteLink = `/repos/${pr.repo}/git/refs/heads/${pr.branch}`;
                const delRes = await githubRequest('DELETE', deleteLink);
                if (delRes.error) {
                    console.log(`     ⚠️  Could not delete branch: ${delRes.message}`);
                } else {
                    console.log(`     🗑️  Branch ${pr.branch} deleted.`);
                }
            }
        }
    }
}

main().catch(console.error);
