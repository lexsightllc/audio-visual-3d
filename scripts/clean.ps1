#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot/lib/common.ps1"

Push-Location $RootDir
try {
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist, build, coverage, artifacts, logs, reports, sbom, 'node_modules/.cache'
    New-Item -ItemType Directory -Force -Path artifacts | Out-Null
    New-Item -ItemType Directory -Force -Path logs | Out-Null
    New-Item -ItemType Directory -Force -Path reports | Out-Null
    New-Item -ItemType Directory -Force -Path sbom | Out-Null
} finally {
    Pop-Location
}
