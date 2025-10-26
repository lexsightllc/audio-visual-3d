#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

Show-NodeVersion
Push-Location $RootDir
try {
    npm ci
    npx playwright install --with-deps
    npx husky install | Out-Null
    git config commit.template .gitmessage
} finally {
    Pop-Location
}

Write-Host 'Bootstrap complete.'
