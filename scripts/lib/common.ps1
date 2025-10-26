$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir = Resolve-Path (Join-Path $ScriptDir '..')

function Invoke-Npm {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [String[]]$Arguments
    )

    Push-Location $RootDir
    try {
        npm @Arguments
    }
    finally {
        Pop-Location
    }
}

function Show-NodeVersion {
    $nvmrc = Join-Path $RootDir '.nvmrc'
    if (Test-Path $nvmrc) {
        $required = Get-Content $nvmrc -Raw
        Write-Host "Using Node.js version $required (set via .nvmrc)"
    }
}
