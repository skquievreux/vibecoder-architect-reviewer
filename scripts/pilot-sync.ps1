# Pilot Repository Sync - REAL DATA VERSION (DEEP SEARCH)
# Liest echte Daten aus den lokalen Ordnern - mit rekursiver Suche

Write-Host "START DER PILOT-SYNCHRONISATION (DEEP SEARCH)" -ForegroundColor Green

# Konfiguration
$DASHBOARD_URL = "https://vibecode.runitfast.xyz"
$MASTER_API_KEY = "dashboard-master-2024"
$LOCAL_BASE_DIR = Resolve-Path ".."

$REPOS = @(
    "skquievreux/DevVault",
    "skquievreux/leadmagnet-quiz-mitochondrien",
    "skquievreux/veridex",
    "skquievreux/s3-mcp-server",
    "skquievreux/clip-sync-collab",
    "skquievreux/albumpromotion",
    "skquievreux/art-vibe-gen",
    "skquievreux/agent-dialogue-manager",
    "skquievreux/visual-image-composer",
    "skquievreux/youtube-landing-page"
)

$TOTAL_COUNT = $REPOS.Count
$SUCCESS_COUNT = 0
$ERROR_COUNT = 0

Write-Host "Dashboard URL: $DASHBOARD_URL" -ForegroundColor Cyan
Write-Host "Local Base Dir: $LOCAL_BASE_DIR" -ForegroundColor Cyan
Write-Host ""

# Helper Funktion zum rekursiven Finden der API Spec
function Get-LocalApiSpec {
    param ($createPath)
    
    Write-Host "   Suche in: $createPath" -ForegroundColor Gray
    
    # Suche rekursiv nach spezifischen Dateinamen, schließe node_modules und .git aus
    $files = Get-ChildItem -Path $createPath -Include "openapi.json", "swagger.json", "openapi.yaml", "swagger.yaml" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.git" -and $_.FullName -notmatch "dist" -and $_.FullName -notmatch "\.next" } |
    Select-Object -First 1

    if ($files) {
        Write-Host "   ✅ SPEC GEFUNDEN: $($files.FullName)" -ForegroundColor Green
        # Lese Dateiinhalt
        $content = Get-Content $files.FullName -Raw
        return $content
    }
    
    return $null
}

# Helper Funktion zum Finden des lokalen Ordners (wie zuvor)
function Get-LocalRepoPath {
    param ($repoNameFull)
    $simpleName = $repoNameFull.Split('/')[-1]
    
    $path = Join-Path $LOCAL_BASE_DIR $simpleName
    if (Test-Path $path) { return $path }
    
    $found = Get-ChildItem -Path $LOCAL_BASE_DIR -Filter $simpleName -Directory | Select-Object -First 1
    if ($found) { return $found.FullName }
    
    # Flexible Namen
    if ($simpleName -eq "youtube-landing-page") {
        $altPath = Join-Path $LOCAL_BASE_DIR "YoutubeLP"
        if (Test-Path $altPath) { return $altPath }
    }
    if ($simpleName -eq "visual-image-composer") {
        $altPath = Join-Path $LOCAL_BASE_DIR "visualimagecomposer"
        if (Test-Path $altPath) { return $altPath }
    }

    return $null
}

# Jedes Repository synchronisieren
foreach ($repo in $REPOS) {
    try {
        $repoName = $repo.Split('/')[-1]
        Write-Host "[$($REPOS.IndexOf($repo) + 1)/$TOTAL_COUNT] Processing: $repo" -ForegroundColor Yellow
        
        # 1. Lokalen Ordner finden
        $localPath = Get-LocalRepoPath $repo
        
        $realApiSpec = $null
        
        if (-not $localPath) {
            Write-Host "   [WARN] Lokaler Ordner nicht gefunden" -ForegroundColor Red
        }
        else {
            # 2. API Spec suchen (Deep Search)
            $realApiSpec = Get-LocalApiSpec $localPath
        }
        
        if (-not $realApiSpec) {
            Write-Host "   [INFO] Keine API Spec Datei gefunden (auch nach Deep Search)" -ForegroundColor Gray
        }

        # 3. Payload bauen
        $jsonPayload = @{
            repoName      = $repoName
            nameWithOwner = $repo
            repoUrl       = "https://github.com/$repo"
            description   = "Pilot repository (Deep-Sync)"
            isPrivate     = $true
            apiSpec       = $realApiSpec
            metadata      = @{
                syncSource = "local-script-deep-v3"
                timestamp  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
        }
        
        $jsonString = $jsonPayload | ConvertTo-Json -Depth 10 -Compress
        
        # API senden
        $response = Invoke-WebRequest -Uri "$DASHBOARD_URL/api/system/ingest" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "x-api-key" = $MASTER_API_KEY } `
            -Body $jsonString `
            -TimeoutSec 30 `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host "   [SUCCESS] Updated" -ForegroundColor Green
            $SUCCESS_COUNT++
        }
        else {
            Write-Host "   [FAIL] HTTP $($response.StatusCode)" -ForegroundColor Red
            $ERROR_COUNT++
        }
    }
    catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        $ERROR_COUNT++
    }
    Write-Host ""
}

Write-Host "=== DEEP SYNC COMPLETE ===" -ForegroundColor Cyan
Write-Host "Success: $SUCCESS_COUNT / Total: $TOTAL_COUNT"