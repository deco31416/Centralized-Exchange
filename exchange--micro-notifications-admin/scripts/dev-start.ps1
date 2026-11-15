param(
  [int]$Port = 7102,
  [string]$ServiceToken = $env:NOTIFICATIONS_SERVICE_TOKEN
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ServiceToken) -or $ServiceToken -eq "xxxxx--xxxxx") {
  throw "Set NOTIFICATIONS_SERVICE_TOKEN to the same generated local value used by the auth service."
}

# Ports (avoid 7000/3000)
$env:PORT = "$Port"

# Service-to-service auth
$env:SERVICE_TOKENS = '{"micro-ng-auth":"' + $ServiceToken + '"}'

Write-Host "[micro-notifications] Starting on port $env:PORT (no .env changes)" -ForegroundColor Cyan
Write-Host "[micro-notifications] SERVICE_TOKENS set for micro-ng-auth" -ForegroundColor Cyan

yarn start:dev
