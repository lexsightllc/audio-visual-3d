#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

Show-NodeVersion
Push-Location $RootDir
try {
    $port = $env:PORT
    if (-not $port) { $port = 5173 }
    npm run dev -- --host 0.0.0.0 --port $port
} finally {
    Pop-Location
}
