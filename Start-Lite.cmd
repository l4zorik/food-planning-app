@echo off
setlocal
cd /d "%~dp0"
where pwsh.exe >nul 2>nul
if errorlevel 1 (
  powershell.exe -NoProfile -File "%~dp0scripts\start-lite.ps1"
) else (
  pwsh.exe -NoProfile -File "%~dp0scripts\start-lite.ps1"
)
if errorlevel 1 pause
