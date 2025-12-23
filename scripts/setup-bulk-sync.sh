#!/bin/bash

# GitHub Actions Bulk Setup Script for Dashboard Sync
# Uses Master Key approach for all private repositories

set -e  # Exit on error

# Configuration
DASHBOARD_URL="https://vibecode.runitfast.xyz"
MASTER_API_KEY="dashboard-master-2024"
WORKFLOW_FILE="workflow-templates/enhanced-dashboard-sync.yml"
REPO_LIST_FILE="${1:-pilot-repositories.csv}"  # Default to pilot, can use all-repositories.csv

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is not installed. Please install it first."
        exit 1
    fi
    
    # Check if authenticated with GitHub
    if ! gh auth status &> /dev/null; then
        error "Not authenticated with GitHub. Run 'gh auth login' first."
        exit 1
    fi
    
    # Check if workflow file exists
    if [ ! -f "$WORKFLOW_FILE" ]; then
        error "Workflow file not found: $WORKFLOW_FILE"
        exit 1
    fi
    
    # Check if repository list exists
    if [ ! -f "$REPO_LIST_FILE" ]; then
        error "Repository list file not found: $REPO_LIST_FILE"
        exit 1
    fi
    
    success "All prerequisites check passed!"
}

# Function to add secrets to repository
add_secrets_to_repository() {
    local repo=$1
    local retry_count=0
    local max_retries=3
    
    log "Adding secrets to $repo..."
    
    while [ $retry_count -lt $max_retries ]; do
        # Add DASHBOARD_URL secret
        if gh secret set DASHBOARD_URL --body "$DASHBOARD_URL" --repo "$repo" 2>/dev/null; then
            success "  ✓ DASHBOARD_URL secret added to $repo"
        else
            warning "  ⚠ Failed to add DASHBOARD_URL to $repo (attempt $((retry_count + 1))/$max_retries)"
            ((retry_count++))
            sleep 2
            continue
        fi
        
        # Add DASHBOARD_API_KEY secret
        if gh secret set DASHBOARD_API_KEY --body "$MASTER_API_KEY" --repo "$repo" 2>/dev/null; then
            success "  ✓ DASHBOARD_API_KEY secret added to $repo"
        else
            warning "  ⚠ Failed to add DASHBOARD_API_KEY to $repo (attempt $((retry_count + 1))/$max_retries)"
            ((retry_count++))
            sleep 2
            continue
        fi
        
        # If both secrets added successfully, break
        break
    done
    
    if [ $retry_count -eq $max_retries ]; then
        error "  ✗ Failed to add secrets to $repo after $max_retries attempts"
        return 1
    fi
    
    return 0
}

# Function to create or update workflow file
setup_workflow() {
    local repo=$1
    
    log "Setting up workflow for $repo..."
    
    # Create .github/workflows directory structure
    # Using the API to create the workflow file
    local workflow_content=$(cat "$WORKFLOW_FILE")
    local workflow_name="enhanced-dashboard-sync.yml"
    
    # Base64 encode the content for GitHub API
    local encoded_content=$(echo "$workflow_content" | base64 -w 0)
    
    # Try to create/update the workflow file
    if gh api --method PUT \
        repos/"$repo"/contents/.github/workflows/"$workflow_name" \
        --field message="Add enhanced dashboard sync workflow" \
        --field content="$encoded_content" \
        --field branch="main" 2>/dev/null || \
       gh api --method PUT \
        repos/"$repo"/contents/.github/workflows/"$workflow_name" \
        --field message="Add enhanced dashboard sync workflow" \
        --field content="$encoded_content" \
        --field branch="master" 2>/dev/null; then
        success "  ✓ Workflow file created/updated in $repo"
    else
        warning "  ⚠ Could not create workflow file in $repo (may need manual setup)"
        return 1
    fi
    
    return 0
}

# Function to trigger workflow
trigger_workflow() {
    local repo=$1
    
    log "Triggering workflow for $repo..."
    
    # Wait a moment for GitHub to process the workflow file
    sleep 3
    
    if gh workflow run enhanced-dashboard-sync.yml --repo "$repo" 2>/dev/null; then
        success "  ✓ Workflow triggered for $repo"
    else
        warning "  ⚠ Could not trigger workflow for $repo (may need manual trigger)"
        return 1
    fi
    
    return 0
}

# Main function to process repositories
process_repositories() {
    local total_count=0
    local success_count=0
    local error_count=0
    
    log "Processing repositories from $REPO_LIST_FILE..."
    
    # Read repository list and process each
    while IFS= read -r repo || [[ -n "$repo" ]]; do
        # Skip empty lines and comments
        if [[ -z "$repo" || "$repo" == \#* ]]; then
            continue
        fi
        
        ((total_count++))
        log "Processing repository $total_count: $repo"
        
        # Process repository
        if add_secrets_to_repository "$repo" && setup_workflow "$repo"; then
            # Trigger workflow after successful setup
            trigger_workflow "$repo"
            ((success_count++))
        else
            ((error_count++))
        fi
        
        # Add delay between repositories to avoid rate limiting
        sleep 2
        
        # Print progress
        log "Progress: $total_count processed, $success_count successful, $error_count failed"
        echo "---"
        
    done < "$REPO_LIST_FILE"
    
    # Final summary
    log "=== SETUP COMPLETE ==="
    log "Total repositories processed: $total_count"
    success "Successful setups: $success_count"
    if [ $error_count -gt 0 ]; then
        error "Failed setups: $error_count"
    fi
    log "===================="
}

# Function to display help
show_help() {
    echo "GitHub Actions Bulk Setup Script for Dashboard Sync"
    echo ""
    echo "Usage: $0 [REPOSITORY_LIST_FILE]"
    echo ""
    echo "Arguments:"
    echo "  REPOSITORY_LIST_FILE    Path to CSV file with repositories (default: pilot-repositories.csv)"
    echo ""
    echo "Examples:"
    echo "  $0                              # Use pilot-repositories.csv (10 repositories)"
    echo "  $0 all-repositories.csv         # Use all-repositories.csv (135 repositories)"
    echo ""
    echo "Prerequisites:"
    echo "  - GitHub CLI (gh) installed and authenticated"
    echo "  - Write access to target repositories"
    echo "  - enhanced-dashboard-sync.yml must exist"
    echo ""
}

# Main script execution
main() {
    # Parse command line arguments
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            # Use provided file or default
            if [ -n "$1" ]; then
                REPO_LIST_FILE="$1"
            fi
            ;;
    esac
    
    log "Starting GitHub Actions bulk setup..."
    log "Dashboard URL: $DASHBOARD_URL"
    log "Repository List: $REPO_LIST_FILE"
    log "Master API Key: ${MASTER_API_KEY:0:8}..."
    
    # Run the setup process
    check_prerequisites
    process_repositories
    
    log "Bulk setup script completed!"
    echo ""
    log "Next steps:"
    log "1. Monitor the workflow runs in GitHub"
    log "2. Check the dashboard at $DASHBOARD_URL for synced data"
    log "3. Review any errors in the workflow logs"
}

# Run main function with all arguments
main "$@"