# Bulk Deploy Workflows to Local Repositories
# Works without GitHub CLI - uses local repos only

param(
    [Parameter(Mandatory = $false)]
    [string]$ReposDirectory = "C:\CODE\GIT",
    
    [Parameter(Mandatory = $false)]
    [string[]]$Workflows = @('ci.yml', 'release.yml', 'dashboard-sync.yml', 'ecosystem-guard.yml', 'rollout-standards.yml'),
    
    [Parameter(Mandatory = $false)]
    [string[]]$SkipRepos = @('.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer'),
    
    [switch]$DryRun,
    
    [switch]$AutoCommit
)

Write-Host "=== Bulk Workflow Template Deployment ===" -ForegroundColor Cyan
Write-Host "Repos Directory: $ReposDirectory" -ForegroundColor Yellow
Write-Host "Dry Run: $($DryRun.IsPresent)" -ForegroundColor Yellow
Write-Host "Auto Commit: $($AutoCommit.IsPresent)" -ForegroundColor Yellow
Write-Host ""

$templatesDir = Join-Path $PSScriptRoot "..\workflow-templates"
$deployedCount = 0
$skippedCount = 0
$failedRepos = @()
$successRepos = @()

# Verify templates directory exists
if (-not (Test-Path $templatesDir)) {
    Write-Host "ERROR: Templates directory not found: $templatesDir" -ForegroundColor Red
    exit 1
}

# Get all directories in repos folder
Write-Host "Scanning for repositories in: $ReposDirectory" -ForegroundColor Green

$allDirs = Get-ChildItem -Path $ReposDirectory -Directory -ErrorAction SilentlyContinue

if (-not $allDirs) {
    Write-Host "ERROR: No directories found in $ReposDirectory" -ForegroundColor Red
    exit 1
}

# Filter to only Git repositories
$repos = $allDirs | Where-Object { 
    (Test-Path (Join-Path $_.FullName ".git")) -and 
    ($_.Name -notin $SkipRepos)
}

Write-Host "Found $($repos.Count) Git repositories (excluding $($SkipRepos.Count) skipped)" -ForegroundColor Green
Write-Host ""

foreach ($repo in $repos) {
    $repoName = $repo.Name
    $repoPath = $repo.FullName
    
    Write-Host "Processing: $repoName" -ForegroundColor Cyan
    
    $workflowsDir = Join-Path $repoPath ".github\workflows"
    
    try {
        # Create workflows directory if needed
        if (-not (Test-Path $workflowsDir)) {
            if ($DryRun) {
                Write-Host "  [DRY RUN] Would create .github/workflows directory" -ForegroundColor Magenta
            }
            else {
                New-Item -ItemType Directory -Path $workflowsDir -Force | Out-Null
                Write-Host "  Created .github/workflows directory" -ForegroundColor Green
            }
        }
        
        $deployedInRepo = 0
        $workflowsList = @()
        
        # Deploy each workflow
        foreach ($workflow in $Workflows) {
            $sourcePath = Join-Path $templatesDir $workflow
            $targetPath = Join-Path $workflowsDir $workflow
            
            if (-not (Test-Path $sourcePath)) {
                Write-Host "  WARNING: Template not found: $workflow" -ForegroundColor Yellow
                continue
            }
            
            if (Test-Path $targetPath) {
                Write-Host "  Skip: $workflow (already exists)" -ForegroundColor Gray
                continue
            }
            
            if ($DryRun) {
                Write-Host "  [DRY RUN] Would copy: $workflow" -ForegroundColor Magenta
            }
            else {
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
                Write-Host "  Added: $workflow" -ForegroundColor Green
            }
            
            $deployedInRepo++
            $workflowsList += $workflow
        }
        
        # Commit and push if requested and workflows were deployed
        if ($deployedInRepo -gt 0) {
            if ($AutoCommit -and -not $DryRun) {
                Write-Host "  Committing changes..." -ForegroundColor Yellow
                
                Push-Location $repoPath
                
                try {
                    git add .github/workflows 2>&1 | Out-Null
                    
                    $commitMessage = "chore: add workflow templates from organization`n`nDeployed workflows:`n"
                    foreach ($wf in $workflowsList) {
                        $commitMessage += "- $wf`n"
                    }
                    
                    git commit -m $commitMessage 2>&1 | Out-Null
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  Committed locally" -ForegroundColor Green
                        Write-Host "  Run 'git push' to upload to GitHub" -ForegroundColor Yellow
                    }
                    else {
                        Write-Host "  WARNING: Nothing to commit" -ForegroundColor Yellow
                    }
                }
                catch {
                    Write-Host "  ERROR during commit: $_" -ForegroundColor Red
                }
                finally {
                    Pop-Location
                }
            }
            else {
                Write-Host "  Files copied. Run git add/commit/push manually" -ForegroundColor Yellow
            }
            
            $successRepos += $repoName
        }
        
        $deployedCount++
        Write-Host "  Completed: $repoName" -ForegroundColor Green
        
    }
    catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        $failedRepos += $repoName
    }
    
    Write-Host ""
}

# Summary
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Repositories processed: $deployedCount" -ForegroundColor Green
Write-Host "Repositories with new workflows: $($successRepos.Count)" -ForegroundColor Green
Write-Host "Skipped repos: $($SkipRepos.Count)" -ForegroundColor Yellow
Write-Host "Failed: $($failedRepos.Count)" -ForegroundColor $(if ($failedRepos.Count -gt 0) { "Red" } else { "Green" })

if ($successRepos.Count -gt 0) {
    Write-Host "`nRepositories with new workflows:" -ForegroundColor Green
    $successRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
}

if ($failedRepos.Count -gt 0) {
    Write-Host "`nFailed repositories:" -ForegroundColor Red
    $failedRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`nDeployment complete!" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`nThis was a DRY RUN. Run without -DryRun to actually deploy." -ForegroundColor Yellow
}
elseif (-not $AutoCommit -and $successRepos.Count -gt 0) {
    Write-Host "`nNext steps for each repository:" -ForegroundColor Yellow
    Write-Host "  cd <repo-path>" -ForegroundColor White
    Write-Host "  git add .github/workflows" -ForegroundColor White
    Write-Host "  git commit -m 'chore: add workflow templates'" -ForegroundColor White
    Write-Host "  git push" -ForegroundColor White
}
elseif ($AutoCommit -and $successRepos.Count -gt 0) {
    Write-Host "`nChanges committed locally. Push to GitHub with:" -ForegroundColor Yellow
    foreach ($repo in $successRepos) {
        $repoPath = Join-Path $ReposDirectory $repo
        Write-Host "  cd $repoPath && git push" -ForegroundColor White
    }
}
