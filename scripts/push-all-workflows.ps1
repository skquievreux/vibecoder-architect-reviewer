# Smart Push - Handles pull, merge conflicts, and missing remotes
# Pushes workflow changes intelligently

param(
    [Parameter(Mandatory = $false)]
    [string]$ReposDirectory = "C:\CODE\GIT",
    
    [Parameter(Mandatory = $false)]
    [string[]]$SkipRepos = @('.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer'),
    
    [switch]$Force
)

Write-Host "=== Smart Push Workflow Changes ===" -ForegroundColor Cyan
Write-Host ""

$pushedCount = 0
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
        # Check for unpushed commits
        $branch = git rev-parse --abbrev-ref HEAD 2>&1
        $unpushed = git log origin/$branch..HEAD --oneline 2>&1
        
        if ($unpushed -match "fatal" -or $unpushed -match "unknown revision") {
            # No remote tracking branch
            Write-Host " - No remote configured" -ForegroundColor Yellow
            $skippedCount++
            continue
        }
        
        if (-not $unpushed) {
            Write-Host " - Nothing to push" -ForegroundColor Gray
            $skippedCount++
            continue
        }
        
        # Try to pull first
        $pullOutput = git pull --rebase 2>&1
        
        if ($LASTEXITCODE -ne 0 -and $pullOutput -match "conflict") {
            Write-Host " - Merge conflict, skipping" -ForegroundColor Red
            $failedRepos += $repoName
            continue
        }
        
        # Now push
        $pushOutput = git push 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " - Pushed!" -ForegroundColor Green
            $pushedCount++
            $successRepos += $repoName
        }
        elseif ($pushOutput -match "Permission denied") {
            Write-Host " - No permission (forked repo?)" -ForegroundColor Yellow
            $skippedCount++
        }
        elseif ($pushOutput -match "rejected") {
            Write-Host " - Rejected (needs pull)" -ForegroundColor Yellow
            $skippedCount++
        }
        else {
            Write-Host " - Failed: $($pushOutput -split "`n" | Select-Object -First 1)" -ForegroundColor Red
            $failedRepos += $repoName
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
Write-Host "Successfully pushed: $pushedCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "Failed: $($failedRepos.Count)" -ForegroundColor $(if ($failedRepos.Count -gt 0) { "Red" } else { "Green" })

if ($successRepos.Count -gt 0) {
    Write-Host "`nSuccessfully pushed:" -ForegroundColor Green
    $successRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
}

if ($failedRepos.Count -gt 0) {
    Write-Host "`nFailed (needs manual attention):" -ForegroundColor Red
    $failedRepos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`nDone!" -ForegroundColor Green
