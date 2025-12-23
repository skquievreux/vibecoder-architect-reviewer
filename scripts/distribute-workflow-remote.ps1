# PowerShell Script to Mass-Distribute Sync Workflow & Secrets to ALL Repositories
# Requires: gh cli installed and authenticated with 'workflow' and 'repo' scopes.

$ORG_NAME = "skquievreux"
# Files to distribute (Source -> Target Relative Path)
$FILES_TO_DISTRIBUTE = @{
    "workflow-templates/ci.yml"                      = ".github/workflows/ci.yml"
    "workflow-templates/release.yml"                 = ".github/workflows/release.yml"
    "workflow-templates/ecosystem-guard.yml"         = ".github/workflows/ecosystem-guard.yml"
    "workflow-templates/enhanced-dashboard-sync.yml" = ".github/workflows/dashboard-sync.yml"
    "workflow-templates/.releaserc.json"             = ".releaserc.json"
}

# Secrets to distribute
$SECRETS = @{
    "DASHBOARD_URL"     = "https://vibecode.runitfast.xyz"
    "DASHBOARD_API_KEY" = "dashboard-master-2024" 
    # Semantic Release token usually needed too (GH_TOKEN), but that is often user-level. 
    # If users need NPM_TOKEN, add here.
}

Write-Host "🚀 STARTING GLOBAL STANDARDS DISTRIBUTION" -ForegroundColor Green
Write-Host "   Target Org/User: $ORG_NAME"
Write-Host "   Files to Sync: $($FILES_TO_DISTRIBUTE.Count)"
Write-Host ""

# Cache file content to memory
$FILE_CACHE = @{}
foreach ($src in $FILES_TO_DISTRIBUTE.Keys) {
    if (Test-Path $src) {
        $content = Get-Content $src -Raw
        $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
        $FILE_CACHE[$src] = $base64
    }
    else {
        Write-Warning "Source file not found: $src (Skipping)"
    }
}

# 2. Fetch All Repositories
Write-Host "📥 Fetching repository list..." -ForegroundColor Yellow
# Using gh cli to list all repos (public & private)
$repos = gh repo list $ORG_NAME --limit 200 --json name, defaultBranchRef --template '{{range .}}{{printf "%s|%s\n" .name .defaultBranchRef.name}}{{end}}' 

if (-not $repos) {
    Write-Error "No repositories found or gh cli error."
    exit 1
}

$repoList = $repos -split "`n" | Where-Object { $_ -ne "" }
$total = $repoList.Count

Write-Host "📋 Found $total repositories." -ForegroundColor Cyan

$i = 0
foreach ($entry in $repoList) {
    $i++
    $parts = $entry -split "\|"
    $repoName = $parts[0]
    $defaultBranch = $parts[1]
    
    if (-not $defaultBranch) { $defaultBranch = "main" }

    Write-Host "[$i / $total] Processing $repoName ($defaultBranch)..." -ForegroundColor White

    # A. Set Secrets (Run once per repo)
    foreach ($key in $SECRETS.Keys) {
        $val = $SECRETS[$key]
        # We use Start-Process to pipe input to gh secret set safely
        # echo $val | gh secret set $key --repo "$ORG_NAME/$repoName"
        # PowerShell efficient way:
        try {
            $cmd = "gh"
            $args = @("secret", "set", $key, "--repo", "$ORG_NAME/$repoName", "--body", $val)
            & $cmd $args 2>&1 | Out-Null
            # Write-Host "      + Secret $key set" -ForegroundColor Gray
        }
        catch {
            Write-Host "      ! Failed to set secret $key" -ForegroundColor Red
        }
    }
    # Write-Host "      ✅ Secrets checked" -ForegroundColor Gray

    # B. Push All Files
    foreach ($src in $FILES_TO_DISTRIBUTE.Keys) {
        if (-not $FILE_CACHE.ContainsKey($src)) { continue }
        
        $targetPath = $FILES_TO_DISTRIBUTE[$src]
        
        # We use the GitHub API contents endpoint to Create or Update the file
        # GET sha first (to update)
        $apiUrl = "repos/$ORG_NAME/$repoName/contents/$targetPath"
        
        try {
            # Check if file exists to get SHA
            $existing = gh api $apiUrl 2>$null | ConvertFrom-Json
            $sha = $existing.sha
            $message = "ci: update standard config ($targetPath)"
        }
        catch {
            $sha = $null
            $message = "ci: add standard config ($targetPath)"
        }

        # Construct JSON for PUT
        $body = @{
            message = $message
            content = $FILE_CACHE[$src]
            branch  = $defaultBranch
        }
        
        if ($sha) {
            $body["sha"] = $sha
        }

        # Save body to temp file to avoid escaping issues
        $tempJson = New-TemporaryFile
        $body | ConvertTo-Json -Depth 5 | Set-Content $tempJson.FullName

        try {
            gh api --method PUT $apiUrl --input $tempJson.FullName 2>&1 | Out-Null
            if ($sha) {
                Write-Host "      ✅ UPDATED: $targetPath" -ForegroundColor Green
            }
            else {
                Write-Host "      ✅ CREATED: $targetPath" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "      ❌ FAIL: $targetPath ($_)" -ForegroundColor Red
        }
        
        Remove-Item $tempJson.FullName
    }
}

Write-Host ""
Write-Host "🎉 DISTRIBUTION COMPLETE!" -ForegroundColor Green
