# Script para remover el wrapper con padding de las páginas
$files = @(
    "app\analytics\metricas-negocio\page.tsx",
    "app\analytics\usuarios\page.tsx",
    "app\analytics\volumen\page.tsx",
    "app\analytics\revenue\page.tsx",
    "app\analytics\kpis\page.tsx",
    "app\analytics\reportes\page.tsx",
    "app\compliance\reportes-regulatorios\page.tsx",
    "app\compliance\travel-rule\page.tsx",
    "app\compliance\tax-reporting\page.tsx",
    "app\compliance\jurisdicciones\page.tsx",
    "app\compliance\politicas-aml\page.tsx",
    "app\compliance\investigaciones\page.tsx",
    "app\soporte\base-conocimiento\page.tsx",
    "app\soporte\chat\page.tsx",
    "app\soporte\tickets\page.tsx",
    "app\soporte\respuestas-predefinidas\page.tsx",
    "app\soporte\faqs\page.tsx",
    "app\soporte\metricas\page.tsx",
    "app\notificaciones\personalizacion\page.tsx",
    "app\notificaciones\webhooks\page.tsx",
    "app\notificaciones\templates\page.tsx",
    "app\notificaciones\sms\page.tsx",
    "app\notificaciones\push\page.tsx",
    "app\notificaciones\alertas\page.tsx",
    "app\monitoreo\dashboard-vivo\page.tsx",
    "app\monitoreo\blockchain-sync\page.tsx",
    "app\monitoreo\order-book\page.tsx",
    "app\monitoreo\alertas\page.tsx",
    "app\monitoreo\transacciones\page.tsx",
    "app\monitoreo\health-checks\page.tsx",
    "app\monitoreo\hot-wallets\page.tsx",
    "app\configuracion\apis\page.tsx",
    "app\liquidez\order-book\page.tsx",
    "app\liquidez\proveedores\page.tsx",
    "app\liquidez\spreads\page.tsx",
    "app\configuracion\mantenimiento\page.tsx",
    "app\configuracion\pares-trading\page.tsx",
    "app\configuracion\multi-region\page.tsx",
    "app\configuracion\limites\page.tsx",
    "app\liquidez\conectores\page.tsx",
    "app\configuracion\general\page.tsx",
    "app\configuracion\fees\page.tsx",
    "app\liquidez\profundidad\page.tsx",
    "app\liquidez\market-making\page.tsx",
    "app\api-management\keys\page.tsx",
    "app\api-management\webhooks-api\page.tsx",
    "app\api-management\rate-limiting\page.tsx",
    "app\api-management\sandbox\page.tsx",
    "app\api-management\documentacion\page.tsx",
    "app\api-management\logs\page.tsx"
)

$count = 0
$errors = @()

foreach ($file in $files) {
    try {
        Write-Host "Procesando: $file" -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        
        # Reemplazar el div con className específico por Fragment
        $newContent = $content -replace '<div className="flex flex-col gap-4 p-4 lg:p-6">', '<>'
        
        # Encontrar y eliminar el último </div> antes del cierre de la función
        # Esto es un poco más complejo, necesitamos encontrar el </div> correcto
        $lines = $newContent -split "`n"
        $lastDivIndex = -1
        
        for ($i = $lines.Count - 1; $i -ge 0; $i--) {
            if ($lines[$i] -match '^\s*</div>\s*$') {
                # Verificar que la siguiente línea no vacía sea el cierre de la función
                for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                    if ($lines[$j] -match '\S') {
                        if ($lines[$j] -match '^\s*\)\s*$' -or $lines[$j] -match '^\s*}\s*$') {
                            $lastDivIndex = $i
                            break
                        } else {
                            break
                        }
                    }
                }
                if ($lastDivIndex -ne -1) { break }
            }
        }
        
        if ($lastDivIndex -ne -1) {
            $lines[$lastDivIndex] = $lines[$lastDivIndex] -replace '</div>', '</>'
            $newContent = $lines -join "`n"
        }
        
        Set-Content -Path $file -Value $newContent -NoNewline
        $count++
        Write-Host "  ✓ Completado" -ForegroundColor Green
        
    } catch {
        $errors += $file
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Archivos procesados: $count/$($files.Count)" -ForegroundColor Green
if ($errors.Count -gt 0) {
    Write-Host "Archivos con errores: $($errors.Count)" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
Write-Host "========================================" -ForegroundColor Yellow
