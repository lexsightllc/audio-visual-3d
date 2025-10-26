#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

Show-NodeVersion
Push-Location $RootDir
try {
    npm run build | Out-Null
    $port = $env:PORT
    if (-not $port) { $port = 5173 }
    $preview = Start-Process npm -ArgumentList @('run', 'preview', '--', '--host', '127.0.0.1', '--port', $port) -PassThru
    Start-Sleep -Seconds 2
    npm run test:e2e
} finally {
    if ($preview) {
        Stop-Process -Id $preview.Id -ErrorAction SilentlyContinue
    }
    Pop-Location
}
