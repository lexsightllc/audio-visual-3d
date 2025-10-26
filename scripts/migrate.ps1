#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

Show-NodeVersion
Push-Location $RootDir
try {
    if (Test-Path (Join-Path $RootDir 'server/migrations')) {
        npm run migrate -- @args
    } else {
        Write-Warning 'No migrations directory found. Skipping.'
    }
} finally {
    Pop-Location
}
