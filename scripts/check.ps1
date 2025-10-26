#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

function Invoke-Script {
    param(
        [string]$ScriptName,
        [string[]]$Arguments
    )
    & (Join-Path $PSScriptRoot $ScriptName) @Arguments
}

Invoke-Script 'lint.ps1'
Invoke-Script 'typecheck.ps1'
Invoke-Script 'fmt.ps1' @('--check')
Invoke-Script 'test.ps1'
Invoke-Script 'e2e.ps1'
Invoke-Script 'coverage.ps1'
Invoke-Script 'security-scan.ps1'
