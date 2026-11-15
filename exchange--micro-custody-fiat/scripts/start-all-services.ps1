#!/usr/bin/env pwsh
<#
.SYNOPSIS
Inicia los 3 microservicios en orden para testing local

.DESCRIPTION
Este script inicia:
1. wallet-ledger-core (puerto 3003)
2. payments-core (puerto 3002)
3. custody-fiat (puerto 3001)

Cada servicio se inicia en una nueva ventana de terminal.

.EXAMPLE
.\scripts\start-all-services.ps1
#>

$ErrorActionPreference = "Stop"

$deco_ROOT = Split-Path -Parent $PSScriptRoot
Write-Host "📂 DECOX workspace: $deco_ROOT" -ForegroundColor Cyan

# Definir servicios
$services = @(
    @{
        Name = "wallet-ledger-core"
        Path = Join-Path $deco_ROOT "Exchange--micro-wallet-ledger-core"
        Port = 3003
        Color = "Green"
    },
    @{
        Name = "payments-core"
        Path = Join-Path $deco_ROOT "Exchange--micro-payments-core"
        Port = 3002
        Color = "Blue"
    },
    @{
        Name = "custody-fiat"
        Path = Join-Path $deco_ROOT "Exchange--micro-custody-fiat"
        Port = 3001
        Color = "Magenta"
    }
)

Write-Host "`n🚀 Iniciando servicios...`n" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "▶️  Iniciando $($service.Name) en puerto $($service.Port)..." -ForegroundColor $service.Color
    
    # Verificar que el directorio existe
    if (-not (Test-Path $service.Path)) {
        Write-Host "❌ Directorio no encontrado: $($service.Path)" -ForegroundColor Red
        exit 1
    }
    
    # Iniciar en nueva terminal
    Start-Process pwsh -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$($service.Path)'; Write-Host '🔧 $($service.Name) - Puerto $($service.Port)' -ForegroundColor $($service.Color); yarn start:dev"
    )
    
    Write-Host "✅ $($service.Name) iniciando..." -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host "`n✨ Todos los servicios iniciados!" -ForegroundColor Green
Write-Host "`n📋 Servicios corriendo:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  - $($service.Name): http://localhost:$($service.Port)" -ForegroundColor $service.Color
}

Write-Host "`n💡 Para ejecutar smoke tests:" -ForegroundColor Yellow
Write-Host "   cd Exchange--micro-custody-fiat" -ForegroundColor Gray
Write-Host "   yarn test:smoke" -ForegroundColor Gray
Write-Host "   yarn test:webhooks" -ForegroundColor Gray
