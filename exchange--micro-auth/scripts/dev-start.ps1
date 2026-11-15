param(
  [int]$Port = 7001,
  [string]$NotificationsUrl = "http://localhost:7002",
  [string]$NotificationsToken = $env:NOTIFICATIONS_SERVICE_TOKEN,
  [string]$InternalAuthToken = $env:INTERNAL_AUTH_TOKEN
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($NotificationsToken) -or $NotificationsToken -eq "xxxxx--xxxxx") {
  throw "Set NOTIFICATIONS_SERVICE_TOKEN to a generated local value before starting this service."
}
if ([string]::IsNullOrWhiteSpace($InternalAuthToken) -or $InternalAuthToken -eq "xxxxx--xxxxx" -or $InternalAuthToken.Length -lt 24) {
  throw "Set INTERNAL_AUTH_TOKEN to a generated value of at least 24 characters before starting this service."
}

function New-RandomBase64([int]$bytes = 64) {
  $buffer = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes($bytes)
  return [System.Convert]::ToBase64String($buffer)
}

# Ports aligned with DECO31416 local stack
$env:PORT = "$Port"
$env:INTERNAL_AUTH_TOKEN = $InternalAuthToken

# Core deps (do not write .env; override via process env)
if ([string]::IsNullOrWhiteSpace($env:MONGODB_URI)) {
  $env:MONGODB_URI = "mongodb://localhost:27017/deco31416-admin-auth"
}

# JWT + password hashing secrets (auto-generate for local if missing)
if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET) -or $env:JWT_SECRET -eq "xxxxx--xxxxx") {
  $env:JWT_SECRET = New-RandomBase64 64
}
if ([string]::IsNullOrWhiteSpace($env:ARGON2_PEPPER) -or $env:ARGON2_PEPPER -eq "xxxxx--xxxxx") {
  $env:ARGON2_PEPPER = New-RandomBase64 32
}
if ([string]::IsNullOrWhiteSpace($env:JWT_ISSUER)) {
  $env:JWT_ISSUER = "deco31416-admin-auth"
}

# CORS for admin panel and backend gateway
if ([string]::IsNullOrWhiteSpace($env:CORS_ORIGIN)) {
  $env:CORS_ORIGIN = "http://localhost:3100,http://localhost:4000"
}

# OTP policy for local testing
$env:LOGIN_OTP_ENABLED = "true"

# Notifications client (micro-auth -> micro-notifications)
$env:NOTIFICATIONS_SERVICE_URL = $NotificationsUrl
$env:NOTIFICATIONS_BASE_URL = $NotificationsUrl
$env:NOTIFICATIONS_SERVICE_TOKEN = $NotificationsToken

Write-Host "[deco31416-admin-auth] Starting on port $env:PORT (no .env changes)" -ForegroundColor Cyan
Write-Host "[deco31416-admin-auth] Notifications: $NotificationsUrl" -ForegroundColor Cyan

# Use Yarn (repo uses Yarn Berry)
yarn start:dev
