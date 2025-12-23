#!/bin/bash

# Pilot Repository Sync - Manual Version
# Falls GitHub CLI nicht verfügbar, nutzen wir diese Alternative

set -e  # Exit on error

# Configuration
DASHBOARD_URL="https://vibecode.runitfast.xyz"
MASTER_API_KEY="dashboard-master-2024"
REPO_LIST_FILE="pilot-repositories.csv"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if repository list exists
if [ ! -f "$REPO_LIST_FILE" ]; then
    error "Repository list file not found: $REPO_LIST_FILE"
    exit 1
fi

log "Starting pilot repository synchronization..."
log "Dashboard URL: $DASHBOARD_URL"
log "Repository List: $REPO_LIST_FILE"
log "Master API Key: ${MASTER_API_KEY:0:8}..."

# Read and process repositories
TOTAL_COUNT=0
SUCCESS_COUNT=0
ERROR_COUNT=0

while IFS=',' read -r repo_line || [[ -n "$repo_line" ]]; do
    # Remove any quotes and whitespace
    repo=$(echo "$repo_line" | tr -d "'" | xargs)
    
    if [[ -z "$repo" ]]; then
        warning "Empty line encountered, skipping..."
        continue
    fi
    
    ((TOTAL_COUNT++))
    
    log "Processing repository $TOTAL_COUNT: $repo"
    
    # Test API call for this repository
    test_payload=$(cat <<EOF
{
    "repoName": "${repo#*/}",
    "nameWithOwner": "$repo",
    "repoUrl": "https://github.com/$repo",
    "description": "Pilot test repository for enhanced sync",
    "isPrivate": true,
    "apiSpec": null,
    "packageJson": {
        "engines": { "node": ">=20.9.0" },
        "dependencies": { "react": "^19.2.3", "next": "^16.1.0" },
        "framework": "Next.js"
    },
    "fileStructure": ["vercel.json"],
    "metadata": {
        "framework": "Next.js",
        "detectedDeployments": ["Vercel"],
        "gitBranch": "main",
        "gitCommit": "pilot-test",
        "runId": "pilot-run-$(date +%s)",
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
}
EOF
    )
    
    # Send test data to dashboard API
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "$DASHBOARD_URL/api/system/ingest" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $MASTER_API_KEY" \
        -d "$test_payload" \
        2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "307" ]; then
        success "$repo - API test successful (HTTP $http_code)"
        ((SUCCESS_COUNT++))
    elif [ "$http_code" -eq "401" ]; then
        error "$repo - API key authentication failed"
        ((ERROR_COUNT++))
    elif [ "$http_code" -eq "400" ]; then
        error "$repo - Validation error"
        ((ERROR_COUNT++))
    else
        warning "$repo - Unexpected HTTP status: $http_code"
        ((ERROR_COUNT++))
    fi
    
    # Add delay between requests to avoid rate limiting
    sleep 2
    
done < "$REPO_LIST_FILE"

log "=== PILOT PHASE COMPLETE ==="
log "Total repositories processed: $TOTAL_COUNT"
log "Successful API tests: $SUCCESS_COUNT"
log "Failed API tests: $ERROR_COUNT"

if [ $SUCCESS_COUNT -gt 0 ]; then
    success "Pilot phase completed successfully!"
    success "Ready for full rollout of remaining 125 repositories"
else
    error "Pilot phase failed - please check API configuration"
fi

log "=== NEXT STEPS ==="
log "1. Create Pull Request: https://github.com/skquievreux/vibecoder-architect-reviewer/compare/main...feature:enhanced-repository-sync-v2"
log "2. After merge: Full rollout with: ./scripts/setup-bulk-sync.sh all-repositories.csv"
log "3. Monitor progress on dashboard: $DASHBOARD_URL"