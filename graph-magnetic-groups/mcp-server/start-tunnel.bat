@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

REM Auto-detect Obsidian vault root if located inside <Vault>\.obsidian\plugins\graph-magnetic-groups\mcp-server\
for %%I in ("%SCRIPT_DIR%..\..\..\..") do set "CANDIDATE_VAULT=%%~fI"
if defined OBSIDIAN_VAULT_PATH (
  set "VAULT_DIR=%OBSIDIAN_VAULT_PATH%"
) else if exist "%CANDIDATE_VAULT%\.obsidian" (
  set "VAULT_DIR=%CANDIDATE_VAULT%"
) else (
  set "VAULT_DIR=%CD%"
)

node "%SCRIPT_DIR%obsidian-mcp-server.mjs" --vault "%VAULT_DIR%" --tunnel %*
pause
