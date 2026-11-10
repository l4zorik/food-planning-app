$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot '.runtime'
New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null
$installed = Join-Path $projectRoot 'desktop/node_modules/electron/dist/electron.exe'
$cached = Join-Path $runtimeRoot 'electron-39.8.10/electron.exe'
if (Test-Path -LiteralPath $installed) { $electronBinary = $installed }
else {
    if (-not (Test-Path -LiteralPath $cached)) {
        $cacheRoot = Join-Path $env:LOCALAPPDATA 'electron/Cache'
        $archive = Get-ChildItem -LiteralPath $cacheRoot -Recurse -File -Filter 'electron-v39.8.10-win32-x64.zip' -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $archive) { throw 'Electron is not installed. Run scripts/build-lite.ps1 with internet access first.' }
        if ((Get-FileHash -LiteralPath $archive.FullName -Algorithm SHA256).Hash -ne '4478410A35A8399B7745085096695A37877F176755182A71E27EDDC245CD98D5') { throw 'The local cached Electron archive differs from the inspected copy.' }
        Expand-Archive -LiteralPath $archive.FullName -DestinationPath (Split-Path -Parent $cached)
    }
    $electronBinary = $cached
    Write-Host 'Using the locally cached Electron 39.8.10 for the offline preview. New packages use Electron 45.2.3.'
}
$desktopPath = Join-Path $projectRoot 'desktop'
$liteProcess = Start-Process -FilePath $electronBinary -ArgumentList ('"' + $desktopPath + '"') -WorkingDirectory $projectRoot -PassThru -RedirectStandardError (Join-Path $runtimeRoot 'lite-stderr.log') -RedirectStandardOutput (Join-Path $runtimeRoot 'lite-stdout.log')
if ($liteProcess.WaitForExit(3500)) {
    Write-Host 'Electron closed during startup. Diagnostic log:'
    Get-Content -LiteralPath (Join-Path $runtimeRoot 'lite-stderr.log') -Tail 14
    exit 1
}
Write-Host "My Meal Planner Lite is running (PID $($liteProcess.Id))."
