# Distribute Workflow to Local Repositories
# Copies the dashboard sync workflow to all local repositories

Write-Host "ROLEOUT WORKFLOW TO LOCAL REPOSITORIES" -ForegroundColor Green

$SOURCE_WORKFLOW = "workflow-templates/enhanced-dashboard-sync.yml"
$LOCAL_BASE_DIR = Resolve-Path ".."
$MASTER_API_KEY = "dashboard-master-2024"

# Repositories to target (Pilot group)
$REPOS = @(
    "DevVault",
    "leadmagnet-quiz-mitochondrien",
    "veridex",
    "s3-mcp-server",
    "clip-sync-collab",
    "albumpromotion",
    "art-vibe-gen",
    "agent-dialogue-manager",
    "visualimagecomposer",
    "youtube-landing-page",
    "YoutubeLP"
)

# 1. Read the template
$templateContent = Get-Content $SOURCE_WORKFLOW -Raw

# 2. Modify template to use fallback key
$pilotContent = $templateContent.Replace('${{ secrets.DASHBOARD_API_KEY }}', $MASTER_API_KEY)

foreach ($repoName in $REPOS) {
    Write-Host "Processing $repoName..." -ForegroundColor Yellow
    
    # Locate repo
    $repoPath = Join-Path $LOCAL_BASE_DIR $repoName
    
    if (-not (Test-Path $repoPath)) {
        # Try finding directory if name is slightly different
        $found = Get-ChildItem -Path $LOCAL_BASE_DIR -Filter $repoName -Directory | Select-Object -First 1
        if ($found) { 
            $repoPath = $found.FullName 
        }
        else {
            Write-Host "   [MISSING] Repo folder not found: $repoName" -ForegroundColor Red
            continue
        }
    }
    
    Write-Host "   [FOUND] Path: $repoPath" -ForegroundColor Gray
    
    # Ensure .github/workflows exists
    $workflowDir = Join-Path $repoPath ".github\workflows"
    if (-not (Test-Path $workflowDir)) {
        New-Item -ItemType Directory -Force -Path $workflowDir | Out-Null
        Write-Host "   [CREATE] Created .github/workflows directory" -ForegroundColor Gray
    }
    
    # Write workflow file
    $targetFile = Join-Path $workflowDir "dashboard-sync.yml"
    
    try {
        Set-Content -Path $targetFile -Value $pilotContent -Force
        Write-Host "   [OK] Workflow copied to: $targetFile" -ForegroundColor Green
        Write-Host "   [ACTION] You must COMMIT and PUSH this file in $repoName to activate!" -ForegroundColor Yellow
    }
    catch {
        Write-Host "   [FAIL] Failed to write file: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== DISTRIBUTION COMPLETE ===" -ForegroundColor Green
Write-Host "Next steps for you:"
Write-Host "1. Go to each repository folder"
Write-Host "2. Run: git add .github/workflows/dashboard-sync.yml"
Write-Host "3. Run: git commit -m 'ci: add dashboard sync workflow'"
Write-Host "4. Run: git push"
