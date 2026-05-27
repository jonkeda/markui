param(
  [string]$CodeCommand = "code-insiders",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$extensionDir = Join-Path $repoRoot "packages\markui-vscode"
$extensionPackagePath = Join-Path $extensionDir "package.json"

function Assert-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found on PATH."
  }
}

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Script
  )

  Write-Host ""
  Write-Host "==> $Name"
  & $Script
}

Assert-Command "pnpm"
if (-not $SkipInstall) {
  Assert-Command $CodeCommand
}

$extensionPackage = Get-Content -Raw $extensionPackagePath | ConvertFrom-Json
$vsixName = "$($extensionPackage.name)-$($extensionPackage.version).vsix"
$vsixPath = Join-Path $extensionDir $vsixName

Push-Location $repoRoot
try {
  Invoke-Step "Build MarkUI core" {
    pnpm --filter "@jonkeda/markui-core" build
  }

  Invoke-Step "Build VS Code extension production bundle" {
    pnpm --filter "markui-vscode" build:prod
  }
}
finally {
  Pop-Location
}

Push-Location $extensionDir
try {
  Invoke-Step "Package VSIX" {
    pnpm exec vsce package --no-dependencies --out $vsixName
  }
}
finally {
  Pop-Location
}

if ($SkipInstall) {
  Write-Host ""
  Write-Host "Packaged: $vsixPath"
  exit 0
}

Invoke-Step "Install VSIX into VS Code Insiders" {
  & $CodeCommand --install-extension $vsixPath --force
}

Invoke-Step "Verify installed extension" {
  & $CodeCommand --list-extensions --show-versions | Select-String -Pattern "jonkeda.markui-vscode"
}

Write-Host ""
Write-Host "Done. Reload VS Code Insiders to use the newly installed extension."

