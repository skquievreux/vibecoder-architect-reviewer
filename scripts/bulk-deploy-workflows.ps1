# Bulk Deploy Workflows to All Repositories
# Clean version without emoji encoding issues

param(
    [Parameter(Mandatory = $true)]
    [string]$Owner,
    
    [Parameter(Mandatory = $false)]
    [string[]]$Workflows = @('ci.yml', 'release.yml', 'dashboard-sync.yml', 'ecosystem-guard.yml', 'rollout-standards.yml'),
    
    [Parameter(Mandatory = $false)]
    [string[]]$SkipRepos = @('.github', 'Organisation-Repo'),
    
    [switch]$DryRun
)

Write-Host "=== Bulk Workflow Template Deployment ===" -ForegroundColor Cyan
Write-Host "Owner: $Owner" -ForegroundColor Yellow
Write-Host "Dry Run: $($DryRun.IsPresent)" -ForegroundColor Yellow
Write-Host ""

$templatesDir = Join-Path $PSScriptRoot "..\workflow-templates"
$deployedCount = 0
$skippedCount = 0
$failedRepos = @()

# Verify templates directory exists
if (-not (Test-Path $templatesDir)) {
    Write-Host "ERROR: Templates directory not found: $templatesDir" -ForegroundColor Red
    exit 1
}

# Get all repositories
Write-Host "Fetching repositories..." -ForegroundColor Green

try {
    $reposJson = gh repo list $Owner --limit 1000 --json name, nameWithOwner | ConvertFrom-Json
}
catch {
    Write-Host "ERROR: Failed to fetch repositories. Is GitHub CLI installed and authenticated?" -ForegroundColor Red
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

if (-not $reposJson) {
    Write-Host "ERROR: No repositories found" -ForegroundColor Red
    exit 1
}

$repos = $reposJson | Where-Object { $_.name -notin $SkipRepos }

Write-Host "Found $($repos.Count) repositories (excluding $($SkipRepos.Count) skipped)" -ForegroundColor Green
Write-Host ""

foreach ($repo in $repos) {
    $repoName = $repo.name
    $repoFullName = $repo.nameWithOwner
    
    Write-Host "Processing: $repoName" -ForegroundColor Cyan
    
    $repoPath = Join-Path (Split-Path $PSScriptRoot -Parent) "..\$repoName"
    $workflowsDir = Join-Path $repoPath ".github\workflows"
    
    try {
        # Clone if not exists locally
        if (-not (Test-Path $repoPath)) {
            Write-Host "  Cloning repository..." -ForegroundColor Yellow
            if (-not $DryRun) {
                $cloneOutput = gh repo clone $repoFullName $repoPath 2>&1
                if ($LASTEXITCODE -ne 0) {
                    throw "Failed to clone: $cloneOutput"
                }
            }
        }
        else {
            # Pull latest changes
            if (-not $DryRun) {
                Push-Location $repoPath
                try {
                    git pull origin main 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) {
                        git pull origin master 2>&1 | Out-Null
                    }
                }
                finally {
                    Pop-Location
                }
            }
        }
        
        # Create workflows directory
        if (-not (Test-Path $workflowsDir) -and -not $DryRun) {
            New-Item -ItemType Directory -Path $workflowsDir -Force | Out-Null
            Write-Host "  Created .github/workflows directory" -ForegroundColor Green
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
        
        # Commit and push if any workflows were deployed
        if ($deployedInRepo -gt 0 -and -not $DryRun) {
            Write-Host "  Committing and pushing..." -ForegroundColor Yellow
            
            Push-Location $repoPath
            
            try {
                git add .github/workflows 2>&1 | Out-Null
                
                $commitMessage = "chore: add workflow templates from organization`n`nDeployed workflows:`n"
                foreach ($wf in $workflowsList) {
                    $commitMessage += "- $wf`n"
                }
                
                git commit -m $commitMessage 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    git push 2>&1 | Out-Null
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "  SUCCESS: Pushed to GitHub" -ForegroundColor Green
                    }
                    else {
                        Write-Host "  WARNING: Committed locally but push failed" -ForegroundColor Yellow
                    }
                }
                else {
                    Write-Host "  WARNING: Nothing to commit" -ForegroundColor Yellow
                }
            }
            finally {
                Pop-Location
            }
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
Write-Host "Successfully processed: $deployedCount" -ForegroundColor Green
Write-Host "Skipped repos: $($SkipRepos.Count)" -ForegroundColor Yellow
Write-Host "Failed: $($failedRepos.Count)" -ForegroundColor $(if ($failedRepos.Count -gt 0) { "Red" } else { "Green" })

if ($failedRepos.Count -gt 0) {
    Write-Host "`nFailed repositories:" -ForegroundColor Red
    $failedRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`nDeployment complete!" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`nThis was a DRY RUN. Run without -DryRun to actually deploy." -ForegroundColor Yellow
}
