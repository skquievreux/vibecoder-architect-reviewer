# Quick Test Script for Pilot Sync
# Tests a single repository to verify the API is working

Write-Host "TESTING PILOT SYNC API" -ForegroundColor Cyan
Write-Host ""

$DASHBOARD_URL = "https://vibecode.runitfast.xyz"
$MASTER_API_KEY = "dashboard-master-2024"
$TEST_REPO = "skquievreux/test-pilot-repo"

# Test 1: Health Check
Write-Host "[1] Testing API Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$DASHBOARD_URL/api/system/ingest" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "[OK] API is healthy" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "     Service: $($healthData.service)" -ForegroundColor Gray
        Write-Host "     Version: $($healthData.version)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "[FAIL] Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Single Repository Sync
Write-Host "[2] Testing Repository Sync..." -ForegroundColor Yellow

$jsonPayload = @{
    repoName      = "test-pilot-repo"
    nameWithOwner = $TEST_REPO
    repoUrl       = "https://github.com/$TEST_REPO"
    description   = "Test repository for pilot sync verification"
    isPrivate     = $true
    apiSpec       = $null
    packageJson   = @{
        engines      = @{ node = ">=20.9.0" }
        dependencies = @{ 
            react = "^19.2.3"
            next  = "^16.1.0"
        }
        framework    = "Next.js"
    }
    fileStructure = @("vercel.json")
    metadata      = @{
        framework           = "Next.js"
        detectedDeployments = @("Vercel")
        gitBranch           = "main"
        runId               = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
        timestamp           = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
}

try {
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
        Write-Host "[OK] Sync successful (HTTP $statusCode)" -ForegroundColor Green
        
        $responseData = $response.Content | ConvertFrom-Json
        Write-Host ""
        Write-Host "Response Details:" -ForegroundColor Cyan
        Write-Host "  Success: $($responseData.success)" -ForegroundColor Gray
        Write-Host "  Repo ID: $($responseData.repoId)" -ForegroundColor Gray
        Write-Host "  Repo Name: $($responseData.repository.name)" -ForegroundColor Gray
        Write-Host "  Framework: $($responseData.repository.framework)" -ForegroundColor Gray
        Write-Host "  Deployments: $($responseData.repository.deployments -join ', ')" -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "SUCCESS: PILOT SYNC TEST PASSED!" -ForegroundColor Green
        Write-Host "Ready to run full pilot sync with all 10 repositories" -ForegroundColor Green
        
    }
    else {
        Write-Host "[WARN] Unexpected status (HTTP $statusCode)" -ForegroundColor Yellow
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    }
    
}
catch {
    Write-Host "[FAIL] Sync failed" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "  HTTP Status: $statusCode" -ForegroundColor Gray
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "  Error Details: $errorBody" -ForegroundColor Gray
        }
        catch {
            # Ignore
        }
    }
    else {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "FAILED: PILOT SYNC TEST FAILED" -ForegroundColor Red
}
