/**
 * Script de prueba para verificar integración STP/SPEI
 * 
 * Uso: node scripts/test-stp-integration.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('=== Test de Integración STP/SPEI ===\n');

// 1. Verificar variables de entorno
console.log('1. Verificando variables de entorno...');
const requiredEnvVars = [
  'SPEI_STP_EMPRESA',
  'SPEI_STP_PRIVATE_KEY_PATH',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`);
  console.log('\nConfigura estas variables en tu archivo .env.local');
  process.exit(1);
}

console.log('✓ Variables de entorno configuradas\n');

// 2. Verificar existencia de llave privada
console.log('2. Verificando llave privada...');
const keyPath = path.resolve(process.cwd(), process.env.SPEI_STP_PRIVATE_KEY_PATH);

if (!fs.existsSync(keyPath)) {
  console.error(`❌ Llave privada no encontrada en: ${keyPath}`);
  console.log('\nGenera las llaves ejecutando:');
  console.log('  bash scripts/generate-stp-keys.sh dev DECOEXCHANGE');
  process.exit(1);
}

console.log(`✓ Llave privada encontrada: ${keyPath}\n`);

// 3. Test de firma digital
console.log('3. Probando generación de firma digital...');

try {
  const privateKey = fs.readFileSync(keyPath);
  
  // Cadena de prueba
  const cadenaOriginal = '||40072|DECOEXCHANGE|20250127||RAS|90646|1500.50||||1234|||Juan Pérez|012180001234567890||||||||||||REFTEST|7777||||||||';
  
  console.log(`Cadena Original: ${cadenaOriginal.substring(0, 80)}...`);
  
  // Generar firma
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(cadenaOriginal, 'utf8');
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64');
  
  console.log(`Firma generada: ${signature.substring(0, 60)}...`);
  console.log(`Longitud de firma: ${signature.length} caracteres`);
  console.log('✓ Firma digital generada exitosamente\n');
  
} catch (error) {
  console.error(`❌ Error al generar firma: ${error.message}`);
  process.exit(1);
}

// 4. Resumen
console.log('=== Resultado ===');
console.log('✓ Configuración validada');
console.log('✓ Llave privada accesible');
console.log('✓ Firma digital funcional');
console.log('\n✅ El módulo STP/SPEI está listo para usar');
console.log('\nPróximos pasos:');
console.log('  1. Iniciar el servicio: yarn start:dev');
console.log('  2. Probar endpoint: POST http://localhost:3001/api/v1/spei/stp/payment-orders');
console.log('  3. Ver documentación: SPEI_STP_SIGNATURE.md');
