$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pgBin = Join-Path $root ".local\postgres\bin"
$pgData = Join-Path $root ".local\pgdata"
$logFile = Join-Path $root ".local\postgres.log"

if (!(Test-Path (Join-Path $pgBin "pg_ctl.exe"))) {
  throw "Portable PostgreSQL is missing at .local\postgres. Recreate it before running db:start."
}

& (Join-Path $pgBin "pg_ctl.exe") status -D $pgData *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "PostgreSQL already running."
  exit 0
}

& (Join-Path $pgBin "pg_ctl.exe") -D $pgData -l $logFile start
& (Join-Path $pgBin "pg_isready.exe") -h 127.0.0.1 -p 55432 -U postgres
