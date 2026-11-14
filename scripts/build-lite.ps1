$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    function Invoke-Checked {
        param([string]$Command, [string[]]$Arguments)
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
    }
    Invoke-Checked node @('--experimental-strip-types', '--test', 'tests/themes.test.mjs', 'tests/desktop-store.test.cjs', 'tests/desktop-startup.test.cjs')
    Push-Location -LiteralPath (Join-Path $projectRoot 'desktop')
    try {
        $installMode = if (Test-Path -LiteralPath package-lock.json) { 'ci' } else { 'install' }
        Invoke-Checked npm @($installMode, '--ignore-scripts', '--registry=https://registry.npmjs.org/', '--strict-ssl=true', '--cache=../.npm-cache')
        Invoke-Checked npm @('audit', '--audit-level=high', '--cache=../.npm-cache')
        Invoke-Checked node @('node_modules/electron/install.js')
        Invoke-Checked npm @('run', 'build')
        Invoke-Checked npm @('run', 'pack')
    } finally { Pop-Location }
} finally { Pop-Location }
