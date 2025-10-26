#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

$mode = 'write'
foreach ($arg in $args) {
    if ($arg -eq '--check') {
        $mode = 'check'
    } elseif ($arg -eq '--fix') {
        $mode = 'write'
    }
}

Show-NodeVersion
Push-Location $RootDir
try {
    if ($mode -eq 'check') {
        npm run format:check
    } else {
        npm run format
    }
} finally {
    Pop-Location
}
