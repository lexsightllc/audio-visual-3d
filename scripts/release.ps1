#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

Show-NodeVersion
Push-Location $RootDir
try {
    npm run release -- @args
} finally {
    Pop-Location
}
