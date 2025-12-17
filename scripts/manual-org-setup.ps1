# Manual Organization Workflow Setup
# Simple version without complex here-strings

param(
    [Parameter(Mandatory = $true)]
    [string]$OrganizationName,
    
    [Parameter(Mandatory = $false)]
    [string]$TargetDirectory = "C:\CODE\GIT\.github-org-temp"
)

Write-Host "🚀 Manual Organization Workflow Setup" -ForegroundColor Cyan
Write-Host "📦 Organization: $OrganizationName" -ForegroundColor Yellow
Write-Host ""

# Step 1: Create target directory
Write-Host "📁 Step 1: Creating target directory..." -ForegroundColor Green
if (Test-Path $TargetDirectory) {
    Write-Host "   ⚠️  Directory already exists: $TargetDirectory" -ForegroundColor Yellow
    Remove-Item -Path $TargetDirectory -Recurse -Force
    Write-Host "   ✓ Deleted existing directory" -ForegroundColor Green
}

New-Item -ItemType Directory -Path $TargetDirectory -Force | Out-Null
Write-Host "   ✓ Created: $TargetDirectory" -ForegroundColor Green

# Step 2: Create workflow-templates directory
Write-Host ""
Write-Host "📋 Step 2: Creating workflow-templates directory..." -ForegroundColor Green
$templatesDir = Join-Path $TargetDirectory "workflow-templates"
New-Item -ItemType Directory -Path $templatesDir -Force | Out-Null
Write-Host "   ✓ Created: $templatesDir" -ForegroundColor Green

# Step 3: Copy templates
Write-Host ""
Write-Host "📄 Step 3: Copying workflow templates..." -ForegroundColor Green
$sourceDir = Join-Path $PSScriptRoot "..\workflow-templates"

if (-not (Test-Path $sourceDir)) {
    Write-Host "   ❌ Source directory not found: $sourceDir" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -Path $sourceDir -File
$copiedCount = 0

foreach ($file in $files) {
    Copy-Item -Path $file.FullName -Destination $templatesDir -Force
    Write-Host "   ✓ Copied: $($file.Name)" -ForegroundColor Green
    $copiedCount++
}

Write-Host "   ✓ Copied $copiedCount files" -ForegroundColor Green

# Step 4: Create README using Out-File
Write-Host ""
Write-Host "📝 Step 4: Creating README.md..." -ForegroundColor Green

$readmePath = Join-Path $TargetDirectory "README.md"
$readme = New-Object System.Collections.ArrayList

[void]$readme.Add("# $OrganizationName GitHub Actions Templates")
[void]$readme.Add("")
[void]$readme.Add("This repository contains organization-wide GitHub Actions workflow templates.")
[void]$readme.Add("")
[void]$readme.Add("## Available Workflow Templates")
[void]$readme.Add("")
[void]$readme.Add("- **CI Pipeline** (ci.yml) - Continuous Integration")
[void]$readme.Add("- **Semantic Release** (release.yml) - Automated versioning")
[void]$readme.Add("- **Dashboard Sync** (dashboard-sync.yml) - Documentation sync")
[void]$readme.Add("- **Ecosystem Guard** (ecosystem-guard.yml) - Security monitoring")
[void]$readme.Add("- **Rollout Standards** (rollout-standards.yml) - Deployment governance")
[void]$readme.Add("")
[void]$readme.Add("## How to Use")
[void]$readme.Add("")
[void]$readme.Add("These templates will appear automatically in the Actions tab of new repositories.")
[void]$readme.Add("")
[void]$readme.Add("To use in a new repository:")
[void]$readme.Add("- Go to the Actions tab")
[void]$readme.Add("- Click 'New workflow'")
[void]$readme.Add("- Find templates under 'Workflows created by $OrganizationName'")
[void]$readme.Add("")
[void]$readme.Add("## Documentation")
[void]$readme.Add("")
[void]$readme.Add("For detailed information, see the main repository documentation.")
[void]$readme.Add("")
[void]$readme.Add("---")
[void]$readme.Add("")
[void]$readme.Add("Last Updated: $(Get-Date -Format 'yyyy-MM-dd')")
[void]$readme.Add("Maintained by: $OrganizationName DevOps Team")

$readme | Out-File -FilePath $readmePath -Encoding UTF8
Write-Host "   ✓ Created: README.md" -ForegroundColor Green

# Step 5: Initialize git repository
Write-Host ""
Write-Host "🔧 Step 5: Initializing git repository..." -ForegroundColor Green
Push-Location $TargetDirectory
try {
    git init 2>&1 | Out-Null
    git add . 2>&1 | Out-Null
    git commit -m "feat: add organization-wide workflow templates" 2>&1 | Out-Null
    Write-Host "   ✓ Git repository initialized and committed" -ForegroundColor Green
}
catch {
    Write-Host "   ⚠️  Git initialization: $_" -ForegroundColor Yellow
}
finally {
    Pop-Location
}

# Step 6: Summary
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Files created in: $TargetDirectory" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create .github repository on GitHub:" -ForegroundColor White
Write-Host "   https://github.com/organizations/$OrganizationName/repositories/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push the templates:" -ForegroundColor White
Write-Host "   cd $TargetDirectory" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/$OrganizationName/.github.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verify in a test repository" -ForegroundColor White
Write-Host ""

# Open directory
Start-Process explorer.exe $TargetDirectory
Write-Host "📂 Opened directory in Explorer" -ForegroundColor Green
Write-Host ""
