const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const fs = require('fs');
const path = require('path');

// Configuration
const WORKFLOW_SRC = path.join(__dirname, '../public/sample-dashboard-sync.yml');
const WORKFLOW_DEST = '.github/workflows/dashboard-sync.yml';

function getEnvVar(name) {
    

        console.log("\n🎉 Deployment Complete!");

    } catch (e) {
        console.error("❌ Fatal Error:", e.message);
        console.error("Ensure 'gh' CLI is installed and authenticated.");
    }
}

main();
