param([switch]$NoSplash, [int]$TimeoutSeconds = 60)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $projectRoot '.runtime'
$splash = $null
$liteProcess = $null
$stderr = $null
$marker = $null
$exitCode = 0

function Update-Splash([string]$message) {
    if ($splash) {
        $splash.FindName('StartupStatus').Text = $message
        $splash.Dispatcher.Invoke([Action]{}, [Windows.Threading.DispatcherPriority]::Background)
    }
}

try {
    New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null
    if (-not $NoSplash) {
        . (Join-Path $PSScriptRoot 'startup-splash.ps1')
        $splash = New-StartupSplash -ProjectRoot $projectRoot
        $splash.Show()
        Update-Splash 'Připravujeme váš prostor…'
    }
    # Match the manifest; never silently use an old preview runtime.
    $manifest = Get-Content -LiteralPath (Join-Path $projectRoot 'desktop/package.json') -Raw | ConvertFrom-Json
    $version = $manifest.devDependencies.electron
    $installed = Join-Path $projectRoot 'desktop/node_modules/electron/dist/electron.exe'
    $cachedRoot = Join-Path $runtimeRoot "electron-$version"
    $cached = Join-Path $cachedRoot 'electron.exe'
    $installedVersionFile = Join-Path (Split-Path -Parent $installed) 'version'
    if ((Test-Path -LiteralPath $installed) -and (Test-Path -LiteralPath $installedVersionFile) -and ((Get-Content -LiteralPath $installedVersionFile -Raw).Trim() -eq $version)) {
        $electronBinary = $installed
    } else {
        if (-not (Test-Path -LiteralPath $cached)) {
            Update-Splash 'Připravujeme první spuštění…'
            $archive = Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA 'electron/Cache') -Recurse -File -Filter "electron-v$version-win32-x64.zip" -ErrorAction SilentlyContinue | Select-Object -First 1
            if (-not $archive) { throw "Chybí Electron $version. Pro první instalaci spusťte scripts/build-lite.ps1 s připojením k internetu." }
            # Integrity of a known local archive, not a publisher signature.
            $hashes = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'runtime-hashes.json') -Raw | ConvertFrom-Json
            $expected = $hashes.PSObject.Properties[$version].Value
            if (-not $expected -or (Get-FileHash -LiteralPath $archive.FullName -Algorithm SHA256).Hash -ne $expected) { throw 'Archiv Electronu neprošel kontrolou integrity. Použijte scripts/build-lite.ps1.' }
            Expand-Archive -LiteralPath $archive.FullName -DestinationPath $cachedRoot -Force
        }
        $electronBinary = $cached
    }
    # Only runtime binaries receive sandbox read access. Personal data is untouched.
    $binaryRoot = Split-Path -Parent $electronBinary
    $sandboxSid = [Security.Principal.SecurityIdentifier]::new('S-1-15-2-1')
    $runtimeDirectory = [IO.DirectoryInfo]::new($binaryRoot)
    $acl = if ($PSVersionTable.PSEdition -eq 'Core') { [IO.FileSystemAclExtensions]::GetAccessControl($runtimeDirectory) } else { $runtimeDirectory.GetAccessControl() }
    $hasSandboxRead = @($acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier]) | Where-Object {
        $_.IdentityReference.Value -eq $sandboxSid.Value -and
        $_.AccessControlType -eq 'Allow' -and ($_.FileSystemRights -band [Security.AccessControl.FileSystemRights]::ReadAndExecute) -eq [Security.AccessControl.FileSystemRights]::ReadAndExecute
    }).Count -gt 0
    if (-not $hasSandboxRead) {
        $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($sandboxSid, 'ReadAndExecute', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
        if ($PSVersionTable.PSEdition -eq 'Core') { [IO.FileSystemAclExtensions]::SetAccessControl($runtimeDirectory, $acl) } else { $runtimeDirectory.SetAccessControl($acl) }
    }
    $launchId = [Guid]::NewGuid().ToString('N')
    $marker = Join-Path $runtimeRoot "startup-$launchId.json"
    $stderr = Join-Path $runtimeRoot "startup-$launchId-stderr.log"
    $stdout = Join-Path $runtimeRoot "startup-$launchId-stdout.log"
    Update-Splash 'Otevíráme aplikaci…'
    $nodeMode = $env:ELECTRON_RUN_AS_NODE
    $nodeOptions = $env:NODE_OPTIONS
    try {
        Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
        Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
        $liteProcess = Start-Process -FilePath $electronBinary -ArgumentList ('"' + (Join-Path $projectRoot 'desktop') + '" --meal-startup-id=' + $launchId) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardError $stderr -RedirectStandardOutput $stdout
    } finally {
        $env:ELECTRON_RUN_AS_NODE = $nodeMode
        $env:NODE_OPTIONS = $nodeOptions
    }
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        Update-Splash 'Za okamžik můžete začít.'
        if (Test-Path -LiteralPath $marker) {
            $result = Get-Content -LiteralPath $marker -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($result.status -in @('ready', 'focused')) { break }
            throw $result.message
        }
        $liteProcess.Refresh()
        # A second invocation exits as soon as the primary receives its request.
        # Give the primary time to acknowledge focusing its existing window.
        if ($liteProcess.HasExited) {
            for ($ack = 0; $ack -lt 20 -and -not (Test-Path -LiteralPath $marker); $ack++) {
                Update-Splash 'Přepínáme do aplikace…'
                Start-Sleep -Milliseconds 100
            }
            if (Test-Path -LiteralPath $marker) { continue }
            throw "Aplikace skončila před otevřením okna (kód $($liteProcess.ExitCode))."
        }
        Start-Sleep -Milliseconds 80
    }
    if (-not (Test-Path -LiteralPath $marker)) { throw 'Spuštění trvá příliš dlouho. Aplikace nepotvrdila načtení rozhraní.' }
} catch {
    $exitCode = 1
    $detail = $_.Exception.Message
    if ($liteProcess) {
        $liteProcess.Refresh()
        if (-not $liteProcess.HasExited) { Stop-Process -Id $liteProcess.Id -ErrorAction SilentlyContinue }
    }
    $diagnostic = if ($stderr -and (Test-Path -LiteralPath $stderr)) { Get-Content -LiteralPath $stderr -Raw -Encoding UTF8 -ErrorAction SilentlyContinue } else { '' }
    if ($diagnostic -match 'GPU process|Sandboxed processes cannot read') { $detail += "`nWindows zablokoval grafický podproces nebo přístup k běhovým souborům. Zkuste spuštění ze standardní složky vašeho účtu." }
    $failure = Join-Path $runtimeRoot 'startup-error.log'
    try { @([DateTime]::Now.ToString('s'), $detail, $_.ScriptStackTrace, $diagnostic) | Set-Content -LiteralPath $failure -Encoding UTF8 } catch { $failure = $null }
    if (-not $NoSplash) {
        Add-Type -AssemblyName PresentationFramework
        if ($splash) { $splash.Close(); $splash = $null }
        [Windows.MessageBox]::Show("$detail`n`nPodrobnosti: $failure", 'Aplikaci se nepodařilo otevřít', 'OK', 'Error') | Out-Null
    } else { Write-Error -Message "$detail`nPodrobnosti: $failure" -ErrorAction Continue }
} finally {
    if ($splash) { $splash.Close() }
    if ($marker -and (Test-Path -LiteralPath $marker)) { Remove-Item -LiteralPath $marker -ErrorAction SilentlyContinue }
}
exit $exitCode
