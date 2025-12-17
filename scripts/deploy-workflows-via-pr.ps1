# Deploy Workflows via Pull Requests - FIX
# Handles unpushed commits by moving them to feature branch

param(
    [Parameter(Mandatory = $false)]
    [string]$ReposDirectory = "C:\CODE\GIT",
    
    [Parameter(Mandatory = $false)]
    [string[]]$SkipRepos = @('.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer')
)

Write-Host "=== Deploy Workflows via PR (Fix Unpushed) ===" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$skippedCount = 0
$failedRepos = @()
$prCreated = @()

$repos = Get-ChildItem -Path $ReposDirectory -Directory -ErrorAction SilentlyContinue | Where-Object { 
    (Test-Path (Join-Path $_.FullName ".git")) -and 
    ($_.Name -notin $SkipRepos)
}

Write-Host "Processing $($repos.Count) repositories..." -ForegroundColor Green
Write-Host ""

foreach ($repo in $repos) {
    $repoName = $repo.Name
    $repoPath = $repo.FullName
    
    Write-Host "$repoName" -ForegroundColor Cyan -NoNewline
    
    Push-Location $repoPath
    
    try {
        # Check remote
        $remote = git remote 2>&1
        if (-not $remote) {
            Write-Host " - No remote" -ForegroundColor Yellow
            $skippedCount++
            Pop-Location
            continue
        }
        
        # Get current branch
        $currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
        
        # Check for unpushed commits
        $unpushed = git log origin/$currentBranch..HEAD --oneline 2>&1
        
        if ($unpushed -and $unpushed -notmatch "fatal") {
            Write-Host " - Found unpushed commits" -ForegroundColor Yellow
            
            # Create feature branch
            $branchName = "feature/add-workflow-templates"
            git checkout -b $branchName 2>&1 | Out-Null
            
            # Push feature branch
            $pushOutput = git push -u origin $branchName 2>&1
            
            if ($LASTEXITCODE -ne 0) {
                if ($pushOutput -match "Permission denied") {
                    Write-Host " - No permission" -ForegroundColor Yellow
                    git checkout $currentBranch 2>&1 | Out-Null
                    git branch -D $branchName 2>&1 | Out-Null
                }
                else {
                    Write-Host " - Push failed: $pushOutput" -ForegroundColor Red
                    git checkout $currentBranch 2>&1 | Out-Null
                    git branch -D $branchName 2>&1 | Out-Null
                    $failedRepos += $repoName
                }
                $skippedCount++
                Pop-Location
                continue
            }
            
            # Reset original branch to origin
            git checkout $currentBranch 2>&1 | Out-Null
            git reset --hard origin/$currentBranch 2>&1 | Out-Null
            
            # Switch back to feature branch for PR
            git checkout $branchName 2>&1 | Out-Null
            
            # Create PR
            $prOutput = gh pr create --title "chore: add workflow templates" --body "Adds organization-wide workflow templates." --base $currentBranch 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " - PR created!" -ForegroundColor Green
                $successCount++
                $prCreated += $repoName
            }
            elseif ($prOutput -match "already exists") {
                Write-Host " - PR already exists" -ForegroundColor Gray
                $successCount++
            }
            else {
                Write-Host " - PR failed: $prOutput" -ForegroundColor Red
                $failedRepos += $repoName
            }
            
            # Cleanup
            git checkout $currentBranch 2>&1 | Out-Null
            
        }
        else {
            # Check if workflows exist but are committed and pushed (already done)
            if (Test-Path ".github\workflows\ci.yml") {
                Write-Host " - Already up to date" -ForegroundColor Gray
            }
            else {
                # Need to copy templates and create PR (fresh start)
                Write-Host " - No workflows found" -ForegroundColor Yellow
                # (Logic for fresh copy omitted for brevity, assuming previous step did the copy)
            }
            $skippedCount++
        }
        
    }
    catch {
        Write-Host " - Error: $_" -ForegroundColor Red
        $failedRepos += $repoName
    }
    finally {
        Pop-Location
    }
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "PRs created: $successCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Gray
Write-Host "Failed: $($failedRepos.Count)" -ForegroundColor $(if ($failedRepos.Count -gt 0) { "Red" } else { "Green" })

if ($prCreated.Count -gt 0) {
    Write-Host "`nPRs created for:" -ForegroundColor Green
    $prCreated | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
}
