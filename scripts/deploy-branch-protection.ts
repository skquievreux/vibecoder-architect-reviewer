
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Load env
const envLocalPath = path.join(process.cwd(), '.env.local');
// Manual env loading
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const USERNAME = 'skquievreux';

const prisma = new PrismaClient();

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
    console.log("🛡️  Applying Branch Protection Rules (Pro Feature)...");

    if (!GITHUB_TOKEN) {
        console.error("❌ GITHUB_TOKEN missing");
        process.exit(1);
    }

    // 1. Get Repos from DB
    const repos = await prisma.repository.findMany({
        select: {
            nameWithOwner: true,
            defaultBranch: true, // e.g. 'main' or 'master'
            isPrivate: true
        }
    });

    console.log(`📋 Found ${repos.length} repositories.`);

    let successCount = 0;
    let failCount = 0;

    for (const repo of repos) {
        const branch = repo.defaultBranch || 'main'; // Fallback
        const repoName = repo.nameWithOwner;

        // Skip some utility repos if needed, but generally apply to all

        console.log(`\n🔒 Protecting ${repoName} [${branch}] (${repo.isPrivate ? 'Private' : 'Public'})...`);

        // Configuration:
        // - Block Force Pushes: YES
        // - Block Deletions: YES
        // - Enforce Admins: NO (Allows your PAT/Bots to bypass if needed)
        // - PR Reviews: NO (To avoid blocking solo workflow, enable manually if desired)
        const protectionConfig = {
            required_status_checks: null,
            enforce_admins: false,
            required_pull_request_reviews: null,
            restrictions: null,
            // These two are applied via specific flags in some API versions, 
            // but standard 'protection' endpoint usually covers them or we rely on 'allow_force_pushes' field if managing via flexible API.
            // Wait, the standard PUT /repos/.../branches/.../protection endpoint DOES take allow_force_pushes in recent API versions?
            // Actually, standard Protection API has 'allow_force_pushes' object.
            // Let's use the standard "Update branch protection" endpoint payload.

            // NOTE: 'allow_force_pushes' and 'allow_deletions' in the root of the body 
            // might be ignored depending on API version, but usually 'enforce_admins' is key.
            // To STRICTLY disable force pushes, modern GitHub requires 'allow_force_pushes: { enabled: false }' logic 
            // OR checks the 'restrictions'. 
            // Actually, standard "Protected Branch" IMPLICITLY disables force push unless you specify `allow_force_pushes: true`.

            allow_force_pushes: false,
            allow_deletions: false
        };

        const result = await githubRequest('PUT', `/repos/${repoName}/branches/${branch}/protection`, protectionConfig);

        if (result.error) {
            // If 404, maybe branch doesn't exist?
            if (result.status === 404) {
                console.log(`   ⚠️  Branch '${branch}' not found `);
            } else if (result.status === 403 && result.message.includes("Upgrade")) {
                console.log(`   ❌ Pro Upgrade not detected yet? ${result.message}`);
            } else {
                console.log(`   ❌ Failed: ${result.status} - ${result.message}`);
            }
            failCount++;
        } else {
            console.log(`   ✅ Protected! (Force Push: Blocked, Deletion: Blocked)`);
            successCount++;
        }
    }

    console.log(`\n🏁 Done. Protected: ${successCount}, Failed: ${failCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
