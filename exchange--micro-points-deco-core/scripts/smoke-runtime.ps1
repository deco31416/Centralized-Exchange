param(
  [string]$MicroBaseUrl = "http://localhost:9042",
  [string]$AdminGatewayBaseUrl = "http://localhost:8080/api/v1",
  [string]$UserGatewayBaseUrl = "http://localhost:8081/api/v1",
  [string]$InternalAuthToken = $env:INTERNAL_AUTH_TOKEN,
  [string]$AdminJwt = $env:ADMIN_JWT
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$message) {
  Write-Host "-> $message" -ForegroundColor Cyan
}

function Write-Ok([string]$message) {
  Write-Host "OK $message" -ForegroundColor Green
}

function Write-Skip([string]$message) {
  Write-Host "SKIP $message" -ForegroundColor Yellow
}

function Invoke-JsonCheck(
  [string]$Name,
  [string]$Url,
  [hashtable]$Headers = @{}
) {
  Write-Step $Name
  $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 10
  if ($response.StatusCode -lt 200 -or $response.StatusCode -gt 299) {
    throw "$Name failed with HTTP $($response.StatusCode)"
  }
  $json = $response.Content | ConvertFrom-Json
  Write-Ok "$Name HTTP $($response.StatusCode)"
  return $json
}

Write-Host ""
Write-Host "Puntos Deco runtime smoke" -ForegroundColor White
Write-Host "Micro:        $MicroBaseUrl"
Write-Host "GatewayAdmin: $AdminGatewayBaseUrl"
Write-Host "GatewayUser:  $UserGatewayBaseUrl"
Write-Host ""

Invoke-JsonCheck "micro health" "$MicroBaseUrl/api/v1/health" | Out-Null

if ($InternalAuthToken) {
  $internalHeaders = @{
    "x-internal-auth" = $InternalAuthToken
    "x-request-id" = "points-deco-runtime-smoke"
  }
  Invoke-JsonCheck "micro overview" "$MicroBaseUrl/api/v1/points-deco/overview" $internalHeaders | Out-Null
  Invoke-JsonCheck "micro nearby" "$MicroBaseUrl/api/v1/points-deco/nearby?country=CO" $internalHeaders | Out-Null
} else {
  Write-Skip "micro protected endpoints need INTERNAL_AUTH_TOKEN"
}

if ($AdminJwt) {
  $adminHeaders = @{
    Authorization = "Bearer $AdminJwt"
    "x-request-id" = "points-deco-admin-gateway-smoke"
  }
  if ($InternalAuthToken) {
    $adminHeaders["x-internal-auth"] = $InternalAuthToken
  }
  Invoke-JsonCheck "admin gateway overview" "$AdminGatewayBaseUrl/points-deco/overview" $adminHeaders | Out-Null
} else {
  Write-Skip "admin gateway checks need ADMIN_JWT"
}

if ($InternalAuthToken) {
  $userHeaders = @{
    "x-internal-auth" = $InternalAuthToken
    "x-request-id" = "points-deco-user-gateway-smoke"
  }
  Invoke-JsonCheck "user gateway nearby" "$UserGatewayBaseUrl/points-deco/nearby?country=CO" $userHeaders | Out-Null
} else {
  Write-Skip "user gateway protected smoke needs INTERNAL_AUTH_TOKEN"
}

Write-Host ""
Write-Ok "Puntos Deco runtime smoke completed"
