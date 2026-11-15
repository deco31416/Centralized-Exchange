import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const files = [
    "app/analytics/metricas-negocio/page.tsx",
    "app/analytics/usuarios/page.tsx",
    "app/analytics/volumen/page.tsx",
    "app/analytics/revenue/page.tsx",
    "app/analytics/kpis/page.tsx",
    "app/analytics/reportes/page.tsx",
    "app/compliance/reportes-regulatorios/page.tsx",
    "app/compliance/travel-rule/page.tsx",
    "app/compliance/tax-reporting/page.tsx",
    "app/compliance/jurisdicciones/page.tsx",
    "app/compliance/politicas-aml/page.tsx",
    "app/compliance/investigaciones/page.tsx",
    "app/soporte/base-conocimiento/page.tsx",
    "app/soporte/chat/page.tsx",
    "app/soporte/tickets/page.tsx",
    "app/soporte/respuestas-predefinidas/page.tsx",
    "app/soporte/faqs/page.tsx",
    "app/soporte/metricas/page.tsx",
    "app/notificaciones/personalizacion/page.tsx",
    "app/notificaciones/webhooks/page.tsx",
    "app/notificaciones/templates/page.tsx",
    "app/notificaciones/sms/page.tsx",
    "app/notificaciones/push/page.tsx",
    "app/notificaciones/alertas/page.tsx",
    "app/monitoreo/dashboard-vivo/page.tsx",
    "app/monitoreo/blockchain-sync/page.tsx",
    "app/monitoreo/order-book/page.tsx",
    "app/monitoreo/alertas/page.tsx",
    "app/monitoreo/transacciones/page.tsx",
    "app/monitoreo/health-checks/page.tsx",
    "app/monitoreo/hot-wallets/page.tsx",
    "app/configuracion/apis/page.tsx",
    "app/liquidez/order-book/page.tsx",
    "app/liquidez/proveedores/page.tsx",
    "app/liquidez/spreads/page.tsx",
    "app/configuracion/mantenimiento/page.tsx",
    "app/configuracion/pares-trading/page.tsx",
    "app/configuracion/multi-region/page.tsx",
    "app/configuracion/limites/page.tsx",
    "app/liquidez/conectores/page.tsx",
    "app/configuracion/general/page.tsx",
    "app/configuracion/fees/page.tsx",
    "app/liquidez/profundidad/page.tsx",
    "app/liquidez/market-making/page.tsx",
    "app/api-management/keys/page.tsx",
    "app/api-management/webhooks-api/page.tsx",
    "app/api-management/rate-limiting/page.tsx",
    "app/api-management/sandbox/page.tsx",
    "app/api-management/documentacion/page.tsx",
    "app/api-management/logs/page.tsx"
];

let count = 0;
let errors = [];

files.forEach(file => {
    try {
        console.log(`Procesando: ${file}`);
        
        let content = readFileSync(file, 'utf8');
        
        // Reemplazar el div con className específico por Fragment
        const newContent = content
            .replace('<div className="flex flex-col gap-4 p-4 lg:p-6">', '<>')
            .replace(/(\s*)<\/div>(\s*\)(\s*)\}(\s*)$)/, '$1</>$2');
        
        writeFileSync(file, newContent, 'utf8');
        count++;
        console.log(`  ✓ Completado`);
        
    } catch (error) {
        errors.push(file);
        console.error(`  ✗ Error: ${error.message}`);
    }
});

console.log('\n========================================');
console.log(`Archivos procesados: ${count}/${files.length}`);
if (errors.length > 0) {
    console.log(`Archivos con errores: ${errors.length}`);
    errors.forEach(e => console.log(`  - ${e}`));
}
console.log('========================================');
