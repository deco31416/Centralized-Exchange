param(
  [int]$Port = 7002,
  [string]$ServiceToken = $env:NOTIFICATIONS_SERVICE_TOKEN
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ServiceToken) -or $ServiceToken -eq "xxxxx--xxxxx") {
  throw "Set NOTIFICATIONS_SERVICE_TOKEN to the same generated local value used by the auth service."
}

# Ports aligned with DECO31416 local stack
$env:PORT = "$Port"

# Service-to-service auth
$env:SERVICE_TOKENS = '{"deco31416-admin-auth":"' + $ServiceToken + '"}'

Write-Host "[deco31416-admin-notifications] Starting on port $env:PORT (no .env changes)" -ForegroundColor Cyan
Write-Host "[deco31416-admin-notifications] SERVICE_TOKENS set for deco31416-admin-auth" -ForegroundColor Cyan

yarn start:dev
