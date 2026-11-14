# Produces an actual ready-to-run application directory and ZIP, without npm.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'desktop/package.json') -Raw | ConvertFrom-Json
$runtime = Join-Path $projectRoot ".runtime/electron-$($manifest.devDependencies.electron)"
if (-not (Test-Path -LiteralPath (Join-Path $runtime 'electron.exe'))) { throw 'Nejdříve připravte runtime pomocí scripts/start-lite.ps1.' }
$release = Join-Path $projectRoot 'release'
$destination = Join-Path $release "My-Meal-Planner-Lite-$($manifest.version)-Windows"
if (Test-Path -LiteralPath $destination) { throw "Výstup již existuje: $destination. Před novým sestavením ho přesuňte." }
New-Item -ItemType Directory -Path $destination -Force | Out-Null
Get-ChildItem -LiteralPath $runtime | Copy-Item -Destination $destination -Recurse
Rename-Item -LiteralPath (Join-Path $destination 'electron.exe') -NewName 'MealPlanner.exe'
$appRoot = Join-Path $destination 'resources/app'
New-Item -ItemType Directory -Path $appRoot -Force | Out-Null
foreach ($file in @('main.cjs', 'preload.cjs', 'store.cjs', 'startup.cjs', 'branding.cjs', 'package.json', 'lite')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot "desktop/$file") -Destination $appRoot -Recurse
}
@'
MY MEAL PLANNER LITE

Rozbalte celý ZIP do vlastní složky a otevřete MealPlanner.exe.
Aplikace nepotřebuje Node.js, npm ani připojení k internetu.
Jde o přenosný balíček, nikoli klasický instalátor.
Všechny soubory a podsložky musí zůstat vedle EXE.

Při prvním spuštění: Co je nového > Vaše firma, vaše logo.
Data jsou uložena ve vašem uživatelském profilu Windows.
Před přechodem z vývojové verze použijte Zálohovat a poté Obnovit.
Přehled novinek se ukazuje při každém startu.
'@ | Set-Content -LiteralPath (Join-Path $destination 'CTETE-ME.txt') -Encoding UTF8
$zip = "$destination.zip"
Compress-Archive -LiteralPath $destination -DestinationPath $zip -CompressionLevel Optimal
Get-FileHash -LiteralPath $zip -Algorithm SHA256 | ForEach-Object { "$($_.Hash)  $([IO.Path]::GetFileName($zip))" } | Set-Content -LiteralPath "$zip.sha256" -Encoding ascii
Write-Output $zip
