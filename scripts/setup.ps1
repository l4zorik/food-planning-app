param([switch]$Start)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    function Invoke-Checked {
        param([string]$Command, [string[]]$Arguments)
        & $Command @Arguments
        if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
    }

    $manifest = Get-Content -LiteralPath scripts/source-manifest.json -Raw | ConvertFrom-Json
    $expectedRemote = 'https://github.com/l4zorik/food-planning-app.git'
    $expectedCommit = '484eb718cae20a8ad7f60326ca6641c0a5036a18'
    if ($manifest.repository -ne $expectedRemote -or $manifest.commit -ne $expectedCommit) {
        throw 'Unexpected source manifest.'
    }

    # Recover real Git history without overwriting the downloaded working files.
    if (-not (Test-Path -LiteralPath .git)) {
        Invoke-Checked git @('init', '--initial-branch=main')
        Invoke-Checked git @('config', '--local', 'core.hooksPath', '.git/disabled-hooks')
        Invoke-Checked git @('remote', 'add', 'origin', $expectedRemote)
    }
    $remote = & git remote get-url origin
    if ($LASTEXITCODE -ne 0 -or $remote -ne $expectedRemote) { throw 'Unexpected Git origin.' }
    & git rev-parse --verify HEAD 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Invoke-Checked git @('-c', 'core.hooksPath=.git/disabled-hooks', 'fetch', '--depth=1', 'origin', $expectedCommit)
        # Only on an unborn local branch: set the baseline, preserve every working file.
        Invoke-Checked git @('reset', '--mixed', $expectedCommit)
    }

    foreach ($file in $manifest.files) {
        if ($file.path -notmatch '^public/[a-zA-Z0-9_-]+\.(png|jpg)$') { continue }
        if (-not (Test-Path -LiteralPath $file.path)) {
            Invoke-Checked git @('-c', 'core.hooksPath=.git/disabled-hooks', 'restore', "--source=$expectedCommit", '--worktree', '--', $file.path)
        }
        $actualHash = & git hash-object --no-filters -- $file.path
        if ($LASTEXITCODE -ne 0 -or $actualHash -ne $file.sha) {
            throw "Asset differs from the source manifest; left untouched: $($file.path)"
        }
    }

    $env:NEXT_TELEMETRY_DISABLED = '1'
    $env:ENABLE_ANALYTICS = 'false'
    $env:COREPACK_ENABLE_DOWNLOAD_PROMPT = '0'
    $env:COREPACK_HOME = Join-Path $projectRoot '.corepack'
    $env:npm_config_cache = Join-Path $projectRoot '.npm-cache'
    $env:npm_config_registry = 'https://registry.npmjs.org/'
    $env:npm_config_strict_ssl = 'true'
    $env:npm_config_ignore_scripts = 'true'
    $package = Get-Content -LiteralPath package.json -Raw | ConvertFrom-Json
    if ($package.packageManager -ne 'pnpm@12.3.4') { throw 'Review the changed package manager before setup.' }
    $managerVersion = & corepack pnpm --version
    if ($LASTEXITCODE -ne 0 -or ($managerVersion | Select-Object -Last 1) -ne '12.3.4') {
        throw 'Cannot obtain the pinned pnpm@12.3.4 through Corepack. Do not substitute an unverified version.'
    }
    Invoke-Checked corepack @('pnpm', 'install', '--frozen-lockfile', '--ignore-scripts', '--store-dir', '.pnpm-store')
    Invoke-Checked corepack @('pnpm', 'audit', '--audit-level', 'high')
    Invoke-Checked corepack @('pnpm', 'run', 'typecheck')
    Invoke-Checked corepack @('pnpm', 'run', 'build')
    Write-Host 'Setup and checks passed. Local URL: http://127.0.0.1:3000'
    if ($Start) { Invoke-Checked corepack @('pnpm', 'run', 'dev') }
} finally {
    Pop-Location
}
