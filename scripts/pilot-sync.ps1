# Pilot Repository Sync - PowerShell Version
# Einfachere Syntax für Windows PowerShell

Write-Host "🚀 START DER PILOT-SYNCHRONISATION" -ForegroundColor Green

# Konfiguration
$DASHBOARD_URL = "https://vibecode.runitfast.xyz"
$MASTER_API_KEY = "dashboard-master-2024"
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
Write-Host "Repository Count: $TOTAL_COUNT" -ForegroundColor Cyan
Write-Host "API Key: $($MASTER_API_KEY.Substring(0, 8))..." -ForegroundColor Cyan
Write-Host ""

# Jedes Repository synchronisieren
foreach ($repo in $REPOS) {
    $repoName = $repo.Split('/')[-1]
    
    Write-Host "[$($REPOS.IndexOf($repo) + 1)/$TOTAL_COUNT] Synchronisiere: $repo" -ForegroundColor Yellow
    
    # JSON Payload erstellen
    $jsonPayload = @{
        repoName = $repoName
        nameWithOwner = $repo
        repoUrl = "https://github.com/$repo"
        description = "Pilot repository for enhanced sync testing"
        isPrivate = $true
        apiSpec = $null
        packageJson = @{
            engines = @{ node = ">=20.9.0" }
            dependencies = @{ react = "^19.2.3" }
            framework = "Next.js"
        }
        fileStructure = @("vercel.json")
        metadata = @{
            framework = "Next.js"
            detectedDeployments = @("Vercel")
            gitBranch = "main"
            runId = "pilot-$(Get-Date -Format 'yyyyMMddHHmmss')"
            timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    }
    
    try {
        # API-Request senden mit Invoke-WebRequest (gibt StatusCode zurück)
        $response = Invoke-WebRequest -Uri "$DASHBOARD_URL/api/system/ingest" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "x-api-key" = $MASTER_API_KEY } `
            -Body ($jsonPayload | ConvertTo-Json -Depth 10) `
            -TimeoutSec 30 `
            -UseBasicParsing `
            -ErrorAction SilentlyContinue
        
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200 -or $statusCode -eq 201) {
            Write-Host "✅ $repo - Erfolg (HTTP $statusCode)" -ForegroundColor Green
            $SUCCESS_COUNT++
            
            # Parse response body
            try {
                $responseData = $response.Content | ConvertFrom-Json
                if ($responseData.repoId) {
                    Write-Host "   Repository ID: $($responseData.repoId)" -ForegroundColor Gray
                }
            } catch {
                # Ignore JSON parse errors
            }
        } elseif ($statusCode -eq 307 -or $statusCode -eq 308) {
            Write-Host "⚠️ $repo - Redirect (HTTP $statusCode)" -ForegroundColor Yellow
            $ERROR_COUNT++
        } elseif ($statusCode -eq 401) {
            Write-Host "❌ $repo - API Key Fehler (HTTP $statusCode)" -ForegroundColor Red
            $ERROR_COUNT++
        } elseif ($statusCode -eq 400) {
            Write-Host "❌ $repo - Validierungsfehler (HTTP $statusCode)" -ForegroundColor Red
            $ERROR_COUNT++
        } else {
            Write-Host "⚠️ $repo - Unerwarteter Status (HTTP $statusCode)" -ForegroundColor Yellow
            $ERROR_COUNT++
        }
        
        # Kurze Pause zwischen Requests
        Start-Sleep -Seconds 2
        
    } catch {
        # Fange HTTP-Fehler ab
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "❌ $repo - HTTP Fehler $statusCode" -ForegroundColor Red
            
            # Versuche Fehlerdetails zu lesen
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorBody = $reader.ReadToEnd()
                $reader.Close()
                Write-Host "   Details: $errorBody" -ForegroundColor Gray
            } catch {
                # Ignore
            }
        } else {
            Write-Host "💥 $repo - Netzwerkfehler: $($_.Exception.Message)" -ForegroundColor Red
        }
        $ERROR_COUNT++
    }
}

Write-Host ""
Write-Host "=== PILOT-SYNCHRONISATION ABGESCHLOSSEN ===" -ForegroundColor Cyan
Write-Host "Gesamt: $TOTAL_COUNT Repositories"
Write-Host "Erfolgreich: $SUCCESS_COUNT"
Write-Host "Fehlgeschlagen: $ERROR_COUNT"

if ($SUCCESS_COUNT -gt 0) {
    Write-Host "✅ PILOT-PHASE ERFOLGREICH!" -ForegroundColor Green
    Write-Host "🎯 Ready für Full Rollout der verbleibenden 125 Repositories" -ForegroundColor Green
    Write-Host "📊 Überprüfen Sie den Status im Dashboard: $DASHBOARD_URL" -ForegroundColor Cyan
} else {
    Write-Host "❌ PILOT-PHASE FEHLERGESCHLAGEN" -ForegroundColor Red
    Write-Host "🔍 Bitte überprüfen Sie API-Endpunkte und Master Key" -ForegroundColor Yellow
}