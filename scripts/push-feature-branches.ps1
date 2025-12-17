# Deploy Feature Branches Only
# Pushes feature branches so you can create PRs manually on GitHub

param(
    [Parameter(Mandatory = $false)]
    [string]$ReposDirectory = "C:\CODE\GIT",
    
    [Parameter(Mandatory = $false)]
    [string[]]$SkipRepos = @('.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer')
)

Write-Host "=== Push Feature Branches (for manual PRs) ===" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$skippedCount = 0
$failedRepos = @()
$pushedRepos = @()

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
            Write-Host " - Found local commits" -ForegroundColor Yellow
            
            # Create feature branch name
            $branchName = "chore/add-workflow-templates"
            
            # Create branch pointing to current HEAD
            git branch $branchName 2>&1 | Out-Null
            
            # Reset main branch to match origin (cleanup local main)
            git reset --hard origin/$currentBranch 2>&1 | Out-Null
            
            # Push feature branch
            Write-Host " - Pushing '$branchName'..." -ForegroundColor Yellow
            $pushOutput = git push origin $branchName 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " - Pushed! Create PR on GitHub." -ForegroundColor Green
                $successCount++
                $pushedRepos += $repoName
            }
            elseif ($pushOutput -match "Permission denied") {
                Write-Host " - No permission" -ForegroundColor Yellow
                git branch -D $branchName 2>&1 | Out-Null
                $skippedCount++
            }
            else {
                Write-Host " - Push failed" -ForegroundColor Red
                # Don't delete branch so work isn't lost
                $failedRepos += $repoName
            }
            
        }
        else {
            # Check if we should check existing feature branches?
            # For now, just skip
            Write-Host " - No local changes to deploy" -ForegroundColor Gray
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
Write-Host "Branches pushed: $successCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Gray
Write-Host "Failed: $($failedRepos.Count)" -ForegroundColor $(if ($failedRepos.Count -gt 0) { "Red" } else { "Green" })

if ($pushedRepos.Count -gt 0) {
    Write-Host "`nReady for PRs (go to GitHub):" -ForegroundColor Green
    $pushedRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
}
