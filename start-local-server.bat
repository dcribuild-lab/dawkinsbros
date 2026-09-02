@echo off
REM Start the local preview server (uses bundled PowerShell script)
pushd "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-local-server.ps1"
popd
pause
