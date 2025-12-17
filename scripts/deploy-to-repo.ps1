# Quick Deploy Script - Workflows zu einem Repository hinzufügen
# Einfach und ohne Fehler

param(
    [Parameter(Mandatory = $true)]
    [string]$RepoPath
)

$templatesDir = Join-Path $PSScriptRoot "..\workflow-templates"
$workflowsDir = Join-Path $RepoPath ".github\workflows"

Write-Host "Deploying workflows to: $RepoPath"

# Create workflows directory if needed
if (-not (Test-Path $workflowsDir)) {
    New-Item -ItemType Directory -Path $workflowsDir -Force | Out-Null
    Write-Host "Created .github/workflows directory"
}

# Copy all workflow files
$workflows = @('ci.yml', 'release.yml', 'dashboard-sync.yml', 'ecosystem-guard.yml', 'rollout-standards.yml')
$copied = 0

foreach ($workflow in $workflows) {
    $source = Join-Path $templatesDir $workflow
    $target = Join-Path $workflowsDir $workflow
    
    if (Test-Path $target) {
        Write-Host "Skip: $workflow (already exists)"
    }
    else {
        Copy-Item -Path $source -Destination $target -Force
        Write-Host "Added: $workflow"
        $copied++
    }
}

Write-Host "`nCopied $copied new workflows"
Write-Host "`nNext steps:"
Write-Host "  cd $RepoPath"
Write-Host "  git add .github/workflows"
Write-Host "  git commit -m 'chore: add workflow templates'"
Write-Host "  git push"
