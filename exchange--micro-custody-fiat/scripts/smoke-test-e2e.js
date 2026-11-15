/**
 * Smoke test end-to-end para validar flujo completo FIAT
 * 
 * Flujo:
 * 1. Simula evento FIAT_TRANSFER_DETECTED desde custody-fiat hacia payments-core
 * 2. Verifica que payments-core procesó correctamente
 * 3. Verifica acreditación en wallet-ledger-core
 * 
 * Pre-requisitos:
 * - custody-fiat corriendo en puerto 3001
 * - payments-core corriendo en puerto 3002
 * - wallet-ledger-core corriendo en puerto 3003
 * - MongoDB disponible (para verificar outbox)
 * 
 * Uso:
 * node scripts/smoke-test-e2e.js
 */

const axios = require('axios');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// Configuración
const CONFIG = {
  custodyFiatUrl: process.env.CUSTODY_FIAT_URL || 'http://localhost:3001/api/v1',
  paymentsCoreUrl: process.env.PAYMENTS_CORE_URL || 'http://localhost:3002/api/v1',
  ledgerCoreUrl: process.env.LEDGER_CORE_URL || 'http://localhost:3003/api/v1',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/deco_micro_custody_fiat',
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',
  speiSecret: process.env.SPEI_STP_SECRET || '',
};

const requiredSecrets = [
  ['INTERNAL_AUTH_TOKEN', CONFIG.internalAuthToken],
  ['SPEI_STP_SECRET', CONFIG.speiSecret],
];
const missingSecrets = requiredSecrets
  .filter(([, value]) => !value || value === 'xxxxx--xxxxx')
  .map(([name]) => name);

if (missingSecrets.length > 0) {
  throw new Error(`Set valid environment variables before running this script: ${missingSecrets.join(', ')}`);
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.green);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.cyan);
}

function logWarning(message) {
  log(`⚠️  ${message}`, COLORS.yellow);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateSpeiSignature(payload, secret) {
  const canonical = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
}

// Test 1: Verificar que los servicios están disponibles
async function checkServicesHealth() {
  log('\n📋 Test 1: Verificando servicios...', COLORS.blue);
  
  const services = [
    { name: 'custody-fiat', url: `${CONFIG.custodyFiatUrl}/health` },
    { name: 'payments-core', url: `${CONFIG.paymentsCoreUrl}/health` },
    { name: 'wallet-ledger-core', url: `${CONFIG.ledgerCoreUrl}/health` },
  ];

  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      if (response.status === 200) {
        logSuccess(`${service.name} está disponible`);
      } else {
        logWarning(`${service.name} respondió con status ${response.status}`);
      }
    } catch (error) {
      const msg = error.response
        ? `status ${error.response.status}: ${JSON.stringify(error.response.data)}`
        : error.message;
      logError(`${service.name} no responde: ${msg}`);
      throw new Error(`Servicio ${service.name} no disponible`);
    }
  }
}

// Test 2: Simular webhook real (SPEI) contra endpoint unificado
async function sendSpeiWebhook(userId, currency, amountMinorUnits) {
  log(`\n📋 Test 2: Enviando webhook SPEI (stp) a custody-fiat...`, COLORS.blue);
  logInfo(`Usuario: ${userId}, Monto: ${amountMinorUnits} ${currency} (minor units)`);

  const amountMainUnits = Number(amountMinorUnits) / 100;
  const payload = {
    id: `spei_${Date.now()}`,
    amount: amountMainUnits,
    currency,
    reference: userId,
    status: 'completed',
    sender_name: 'Smoke Test',
    sender_account: '012180012345678901',
    created_at: new Date().toISOString(),
  };

  const secret = CONFIG.speiSecret;
  const signature = generateSpeiSignature(payload, secret);
  const routeProvider = 'stp';
  const idempotencyKey = `spei:${payload.id}`;

  try {
    const response = await axios.post(
      `${CONFIG.custodyFiatUrl}/webhooks/${routeProvider}`,
      payload,
      {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json',
        },
        timeout: 10000,
      },
    );

    if (response.status === 200 || response.status === 202) {
      logSuccess('Webhook recibido/procesado por custody-fiat');
      return { idempotencyKey, payloadId: payload.id };
    }

    logError(`Status inesperado de custody-fiat: ${response.status}`);
    throw new Error('Fallo al enviar webhook');
  } catch (error) {
    logError(`Error enviando webhook: ${error.message}`);
    if (error.response) {
      logError(`Response data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// Test 3: Verificar que el evento fue guardado en outbox_events y que el relay lo publica
async function waitForOutboxPublished(idempotencyKey) {
  log('\n📋 Test 3: Verificando outbox (outbox_events + status=published)...', COLORS.blue);
  
  let client;
  try {
    client = await MongoClient.connect(CONFIG.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    const db = client.db();
    const outboxCollection = db.collection('outbox_events');

    const timeoutMs = 45_000;
    const start = Date.now();
    let lastStatus = null;

    while (Date.now() - start < timeoutMs) {
      const entry = await outboxCollection.findOne({ idempotencyKey });
      if (entry) {
        lastStatus = entry.status || 'pending';
        if (entry.status === 'published') {
          logSuccess('Evento publicado (status=published)');
          logInfo(`Event: ${entry.eventName}`);
          logInfo(`Attempts: ${entry.attempts ?? 0}`);
          return entry;
        }

        logInfo(`Status actual: ${lastStatus} (reintentando...)`);
      } else {
        logInfo('Aún no aparece en outbox_events (esperando...)');
      }

      await sleep(2000);
    }

    logWarning(
      `Timeout esperando status=published para idempotencyKey=${idempotencyKey}. Último status: ${lastStatus ?? 'N/A'}`,
    );
    return null;
  } catch (error) {
    logWarning(`No se pudo verificar outbox: ${error.message}`);
    return null;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Test 4: Verificar acreditación en wallet-ledger-core
async function verifyWalletBalance(userId, expectedAmountIncrease, currency) {
  log('\n📋 Test 4: Verificando balance en ledger...', COLORS.blue);
  
  // Esperar un momento para que se procese
  await sleep(2000);
  
  try {
    const response = await axios.get(
      `${CONFIG.ledgerCoreUrl}/wallets/${userId}/balances`,
      {
        headers: {
          'x-internal-auth': CONFIG.internalAuthToken,
        },
        timeout: 5000,
      },
    );
    
    if (response.data && response.data.balances) {
      logSuccess(`Balance obtenido correctamente`);
      
      const balance = response.data.balances.find(b => b.currency === currency);
      
      if (balance) {
        logInfo(`Balance ${currency}: ${balance.available} (available), ${balance.total} (total)`);
        
        // Verificar que el monto sea mayor o igual al esperado
        const availableAmount = parseInt(balance.available, 10);
        const expectedAmount = parseInt(expectedAmountIncrease, 10);
        
        if (availableAmount >= expectedAmount) {
          logSuccess(`Balance acreditado correctamente (>= ${expectedAmount})`);
          return true;
        } else {
          logWarning(`Balance menor al esperado: ${availableAmount} < ${expectedAmount}`);
          return false;
        }
      } else {
        logWarning(`No se encontró balance para ${currency}`);
        logInfo(`Balances disponibles: ${JSON.stringify(response.data.balances)}`);
        return false;
      }
    } else {
      logWarning(`Respuesta inesperada de ledger: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning(`Usuario ${userId} no tiene wallet creado aún`);
      return false;
    }
    logError(`Error al verificar balance: ${error.message}`);
    return false;
  }
}

// Test suite principal
async function runSmokeTests() {
  log('\n🚀 Iniciando Smoke Tests End-to-End', COLORS.cyan);
  log('=' .repeat(60), COLORS.cyan);
  
  const startTime = Date.now();
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Test 1: Health checks
    await checkServicesHealth();
    testsPassed++;
    
    // Test 2: Enviar webhook SPEI (endpoint unificado)
    const userId = `user_test_${Date.now()}`;
    const currency = 'MXN';
    const amountMinorUnits = '50000'; // $500 MXN
    
    const result = await sendSpeiWebhook(userId, currency, amountMinorUnits);
    testsPassed++;
    
    // Test 3: Verificar outbox + relay (published)
    const outboxEntry = await waitForOutboxPublished(result.idempotencyKey);
    if (outboxEntry && outboxEntry.status === 'published') {
      testsPassed++;
    } else {
      testsFailed++;
      logWarning('Test 3 falló pero continuamos...');
    }
    
    // Test 4: Verificar balance
    const balanceOk = await verifyWalletBalance(userId, amountMinorUnits, currency);
    if (balanceOk) {
      testsPassed++;
    } else {
      testsFailed++;
      logWarning('Test 4 falló - balance no acreditado o menor al esperado');
    }
    
    // Resumen
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('\n' + '='.repeat(60), COLORS.cyan);
    log('📊 Resumen de Tests', COLORS.cyan);
    log('=' .repeat(60), COLORS.cyan);
    logSuccess(`Tests exitosos: ${testsPassed}`);
    if (testsFailed > 0) {
      logError(`Tests fallidos: ${testsFailed}`);
    }
    logInfo(`Duración: ${duration}s`);
    
    if (testsFailed === 0) {
      log('\n✨ Todos los tests pasaron correctamente!', COLORS.green);
      process.exit(0);
    } else {
      log('\n⚠️  Algunos tests fallaron, revisar logs arriba', COLORS.yellow);
      process.exit(1);
    }
    
  } catch (error) {
    testsFailed++;
    logError(`Error crítico: ${error.message}`);
    log('\n' + '='.repeat(60), COLORS.cyan);
    log('📊 Resumen de Tests', COLORS.cyan);
    log('=' .repeat(60), COLORS.cyan);
    logSuccess(`Tests exitosos: ${testsPassed}`);
    logError(`Tests fallidos: ${testsFailed}`);
    log('\n❌ Tests fallaron por error crítico', COLORS.red);
    process.exit(1);
  }
}

// Ejecutar tests
runSmokeTests().catch((error) => {
  logError(`Error no manejado: ${error.message}`);
  process.exit(1);
});
