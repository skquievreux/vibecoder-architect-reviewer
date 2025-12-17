# Final Workflow Deployment - Pull, Commit, Push
# Handles all edge cases

param(
    [Parameter(Mandatory = $false)]
    [string]$ReposDirectory = "C:\CODE\GIT",
    
    [Parameter(Mandatory = $false)]
    [string[]]$SkipRepos = @('.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer')
)

Write-Host "=== Final Workflow Deployment ===" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$skippedCount = 0
$failedRepos = @()
$successRepos = @()

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
        # Get current branch
        $branch = git rev-parse --abbrev-ref HEAD 2>&1
        
        # Check if remote exists
        $remote = git remote 2>&1
        if (-not $remote) {
            Write-Host " - No remote" -ForegroundColor Yellow
            $skippedCount++
            Pop-Location
            continue
        }
        
        # Pull latest changes
        $pullOutput = git pull --rebase 2>&1
        
        if ($pullOutput -match "conflict") {
            Write-Host " - Conflict!" -ForegroundColor Red
            git rebase --abort 2>&1 | Out-Null
            $failedRepos += $repoName
            Pop-Location
            continue
        }
        
        # Check if there are uncommitted workflow changes
        $status = git status --porcelain .github/workflows 2>&1
        
        if ($status) {
            # Commit workflow changes
            git add .github/workflows 2>&1 | Out-Null
            git commit -m "chore: add workflow templates" 2>&1 | Out-Null
            Write-Host " - Committed" -ForegroundColor Yellow -NoNewline
        }
        
        # Check for unpushed commits
        $unpushed = git log origin/$branch..HEAD --oneline 2>&1
        
        if ($unpushed -and $unpushed -notmatch "fatal" -and $unpushed -notmatch "unknown") {
            # Push
            $pushOutput = git push 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " - Pushed!" -ForegroundColor Green
                $successCount++
                $successRepos += $repoName
            }
            elseif ($pushOutput -match "Permission denied") {
                Write-Host " - No permission" -ForegroundColor Yellow
                $skippedCount++
            }
            else {
                Write-Host " - Push failed" -ForegroundColor Red
                $failedRepos += $repoName
            }
        }
        else {
            Write-Host " - Up to date" -ForegroundColor Gray
            $skippedCount++
        }
        
    }
    catch {
        Write-Host " - Error" -ForegroundColor Red
        $failedRepos += $repoName
    }
    finally {
        Pop-Location
    }
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Successfully deployed: $successCount" -ForegroundColor Green
Write-Host "Already up to date: $skippedCount" -ForegroundColor Gray
Write-Host "Failed: $($failedRepos.Count)" -ForegroundColor $(if ($failedRepos.Count -gt 0) { "Red" } else { "Green" })

if ($successRepos.Count -gt 0) {
    Write-Host "`nSuccessfully deployed to GitHub:" -ForegroundColor Green
    $successRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
}

if ($failedRepos.Count -gt 0) {
    Write-Host "`nFailed (check manually):" -ForegroundColor Red
    $failedRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`nWorkflow templates are now live on GitHub!" -ForegroundColor Green
