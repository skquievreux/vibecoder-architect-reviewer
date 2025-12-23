@echo off
echo 🚀 SYNCHRONISIEREN DER PILOT-REPOSITORIES...

setlocal count=0
setlocal success_count=0

REM Sync each pilot repository
call :syncRepo skquievreux/veridex
call :syncRepo skquievreux/s3-mcp-server
call :syncRepo skquievreux/clip-sync-collab
call :syncRepo skquievreux/albumpromotion
call :syncRepo skquievreux/art-vibe-gen
call :syncRepo skquievreux/agent-dialogue-manager
call :syncRepo skquievreux/visual-image-composer
call :syncRepo skquievreux/youtube-landing-page

echo.
echo === PILOT SYNCHRONISATION COMPLETE ===
echo Total repositories: %count%
echo Successful: %success_count%

if %success_count% gtr 0 (
    echo ✅ PILOT-PHASE ERFOLGREICH!
    echo Ready for full rollout of remaining repositories
) else (
    echo ❌ PILOT-PHASE FEHLERGESCHLAGEN
)

goto :eof

:syncRepo
setlocal repo=%~1
setlocal repo_name=%repo:*/=%
echo [%TIME%] Syncing %repo_name%...

curl -s -o nul -w "HTTP: %%{http_code} Time: %%{time_total}s" -X POST "https://vibecode.runitfast.xyz/api/system/ingest" -H "Content-Type: application/json" -H "x-api-key: dashboard-master-2024" -d "{\"repoName\":\"%repo_name%\",\"nameWithOwner\":\"%repo%\",\"repoUrl\":\"https://github.com/%repo%\",\"description\":\"Pilot repository enhanced sync\",\"isPrivate\":true,\"apiSpec\":null,\"packageJson\":{\"engines\":{\"node\":\">=20.9.0\"},\"framework\":\"Next.js\"},\"metadata\":{\"gitBranch\":\"main\",\"runId\":\"pilot-run-%%random%%\",\"timestamp\":\"$(date -u +%%Y-%%m-%%dT%%H:%%M:%%SZ)\"}}"

if !errorlevel equ 0 (
    echo [%TIME%] ❌ Failed: HTTP %%errorlevel%%
) else (
    echo [%TIME%] ✅ Success: HTTP %%errorlevel%%
    set /a success_count=%%success_count%%+1
)
set /a count=%%count%%+1
echo.

:closeresults
setlocal url="https://vibecode.runitfast.xyz/api/sync-status?limit=10"
echo [%TIME%] Checking sync status...
curl -s "%url%" | findstr /i "skquievreux" && echo [%TIME%] ✅ Found in dashboard!

:eof