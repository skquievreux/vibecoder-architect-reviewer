# Check Sync Results
# Fetches data from /api/repos and analyzes pilot sync status

Write-Host "ANALYZING SYNC RESULTS..." -ForegroundColor Cyan
Write-Host ""

$DASHBOARD_URL = "https://vibecode.runitfast.xyz"

try {
    # 1. Fetch all repositories
    $response = Invoke-WebRequest -Uri "$DASHBOARD_URL/api/repos" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $repos = $response.Content | ConvertFrom-Json
    
    # 2. Filter for Pilot Repositories (updated recently)
    # We look for repos updated in the last hour
    $now = Get-Date
    $oneHourAgo = $now.AddHours(-1)
    
    $pilotRepos = $repos | Where-Object { 
        $updatedAt = [DateTime]::Parse($_.repo.updatedAt)
        return $updatedAt -gt $oneHourAgo
    }
    
    $count = $pilotRepos.Count
    
    if ($count -gt 0) {
        Write-Host "FOUND $count REPOSITORIES SYNCED IN THE LAST HOUR" -ForegroundColor Green
        Write-Host ""
        
        # 3. Find Last Run Time
        $lastRun = $pilotRepos | Sort-Object -Property { $_.repo.updatedAt } -Descending | Select-Object -First 1
        $lastRunTime = [DateTime]::Parse($lastRun.repo.updatedAt).ToLocalTime()
        $dateStr = $lastRunTime.ToString("yyyy-MM-dd HH:mm:ss")
        
        Write-Host "LAST RUN COMPLETED AT: $dateStr" -ForegroundColor Yellow
        Write-Host ""
        
        # 4. Check for API Documentation
        Write-Host "API DOCUMENTATION STATUS:" -ForegroundColor Cyan
        
        $reposWithDocs = $pilotRepos | Where-Object { $_.repo.apiSpec -ne $null }
        
        if ($reposWithDocs.Count -gt 0) {
            foreach ($item in $reposWithDocs) {
                Write-Host "   [HAS DOCS] $($item.repo.name)" -ForegroundColor Green
            }
        }
        else {
            Write-Host "   [NO DOCS] No repositories have API specs yet." -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "FULL PILOT LIST:" -ForegroundColor Cyan
        foreach ($item in $pilotRepos) {
            Write-Host "   - $($item.repo.name)" -ForegroundColor Gray
        }
        
    }
    else {
        Write-Host "NO RECENTLY SYNCED REPOSITORIES FOUND." -ForegroundColor Yellow
        Write-Host "   Check if the API URL is correct or if the sync actually updated the database." -ForegroundColor Gray
    }

}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
