$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pgBin = Join-Path $root ".local\postgres\bin"
$pgData = Join-Path $root ".local\pgdata"

if (!(Test-Path (Join-Path $pgBin "pg_ctl.exe"))) {
  Write-Host "Portable PostgreSQL is not installed."
  exit 0
}

& (Join-Path $pgBin "pg_ctl.exe") status -D $pgData *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "PostgreSQL is not running."
  exit 0
}

& (Join-Path $pgBin "pg_ctl.exe") -D $pgData stop
