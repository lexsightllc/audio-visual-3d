#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

$fix = $false
foreach ($arg in $args) {
    if ($arg -eq '--fix') {
        $fix = $true
    }
}

Show-NodeVersion
Push-Location $RootDir
try {
    if ($fix) {
        npm run lint:fix
    } else {
        npm run lint
    }
} finally {
    Pop-Location
}
