/**
 * Smoke test avanzado - Simula webhooks reales de providers
 * 
 * Este script envía webhooks reales a los endpoints de providers,
 * simulando lo que STP, Mercado Pago o Stripe enviarían.
 * 
 * Nota: Las firmas son simuladas (modo dev), en producción requieren
 * los secrets reales de cada provider.
 */

const axios = require('axios');
const crypto = require('crypto');

const CONFIG = {
  custodyFiatUrl: process.env.CUSTODY_FIAT_URL || 'http://localhost:3001/api/v1',
  internalAuthToken: process.env.INTERNAL_AUTH_TOKEN || '',
  speiSecret: process.env.SPEI_STP_SECRET || '',
  mercadopagoSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  stripeSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

const requiredSecrets = [
  ['INTERNAL_AUTH_TOKEN', CONFIG.internalAuthToken],
  ['SPEI_STP_SECRET', CONFIG.speiSecret],
  ['MERCADOPAGO_WEBHOOK_SECRET', CONFIG.mercadopagoSecret],
  ['STRIPE_WEBHOOK_SECRET', CONFIG.stripeSecret],
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

function formatAxiosError(error) {
  if (!error) return 'Unknown error';
  const code = error.code ? ` code=${error.code}` : '';
  const status = error.response?.status ? ` status=${error.response.status}` : '';
  const data = error.response?.data ? ` data=${JSON.stringify(error.response.data)}` : '';
  const message = error.message || String(error);
  return `${message}${code}${status}${data}`;
}

async function checkCustodyFiatHealth() {
  const healthUrl = `${CONFIG.custodyFiatUrl}/health`;
  try {
    const res = await axios.get(healthUrl, { timeout: 5000 });
    if (res.status === 200) {
      logSuccess(`custody-fiat health OK (${healthUrl})`);
      return true;
    }
    logError(`custody-fiat health status inesperado: ${res.status}`);
    return false;
  } catch (error) {
    logError(`custody-fiat no responde: ${formatAxiosError(error)}`);
    return false;
  }
}

// Genera firma HMAC-SHA256 para SPEI
function generateSpeiSignature(payload, secret) {
  const canonical = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
}

// Genera firma para Mercado Pago
function generateMercadoPagoSignature(data, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedString = `id:${data.id};request-id:${data.id};ts:${timestamp}`;
  const signature = crypto.createHmac('sha256', secret).update(signedString).digest('hex');
  return `ts=${timestamp},v1=${signature}`;
}

// Genera firma para Stripe
function generateStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// Test webhook SPEI
async function testSpeiWebhook() {
  log('\n🧪 Test: Webhook SPEI (STP)', COLORS.cyan);
  
  const userId = `user_test_${Date.now()}`;
  const payload = {
    id: `spei_${Date.now()}`,
    amount: 500.00,
    currency: 'MXN',
    reference: userId,
    status: 'completed',
    sender_name: 'Juan Perez',
    sender_account: '012180012345678901',
    created_at: new Date().toISOString(),
  };
  
  const signature = generateSpeiSignature(payload, CONFIG.speiSecret);
  
  try {
    const response = await axios.post(
      `${CONFIG.custodyFiatUrl}/webhooks/stp`,
      payload,
      {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json',
        },
        timeout: 10000,
      },
    );
    
    if ([200, 201, 202].includes(response.status)) {
      logSuccess('Webhook SPEI procesado correctamente');
      logInfo(`Usuario: ${userId}`);
      return { provider: 'stp', userId, success: true };
    } else {
      logError(`Status inesperado: ${response.status}`);
      return { provider: 'stp', userId, success: false };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logError('Firma inválida - verificar SPEI_STP_SECRET en .env');
    } else {
      logError(`Error: ${formatAxiosError(error)}`);
    }
    return { provider: 'stp', userId, success: false };
  }
}

// Test webhook Mercado Pago
async function testMercadoPagoWebhook(routeProvider = 'mercadopago') {
  log(`\n🧪 Test: Webhook Mercado Pago (${routeProvider})`, COLORS.cyan);
  
  const userId = `user_test_${Date.now()}`;
  const paymentId = Math.floor(Math.random() * 1000000);
  
  const payload = {
    id: paymentId,
    type: 'payment',
    action: 'payment.created',
    data: {
      id: paymentId.toString(),
    },
    date_created: new Date().toISOString(),
    // Simular datos del payment (normalmente se obtienen con GET /v1/payments/{id})
    _embedded: {
      payment: {
        id: paymentId,
        status: 'approved',
        transaction_amount: 500,
        currency_id: 'MXN',
        description: `Deposit for ${userId}`,
        external_reference: userId,
      },
    },
  };
  
  const signature = generateMercadoPagoSignature(payload, CONFIG.mercadopagoSecret);
  
  try {
    const response = await axios.post(
      `${CONFIG.custodyFiatUrl}/webhooks/${routeProvider}`,
      payload,
      {
        headers: {
          'x-signature': signature,
          'x-request-id': `req_${Date.now()}`,
          'content-type': 'application/json',
        },
        timeout: 10000,
      },
    );
    
    if ([200, 201, 202].includes(response.status)) {
      logSuccess('Webhook Mercado Pago procesado correctamente');
      logInfo(`Usuario: ${userId}`);
      return { provider: routeProvider, userId, success: true };
    } else {
      logError(`Status inesperado: ${response.status}`);
      return { provider: routeProvider, userId, success: false };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logError('Firma inválida - verificar MERCADOPAGO_WEBHOOK_SECRET en .env');
    } else {
      logError(`Error: ${formatAxiosError(error)}`);
    }
    return { provider: routeProvider, userId, success: false };
  }
}

// Test webhook Stripe
async function testStripeWebhook() {
  log('\n🧪 Test: Webhook Stripe', COLORS.cyan);
  
  const userId = `user_test_${Date.now()}`;
  const payload = {
    id: `evt_${Date.now()}`,
    object: 'event',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: `pi_${Date.now()}`,
        object: 'payment_intent',
        amount: 50000, // $500 USD en centavos
        currency: 'usd',
        status: 'succeeded',
        description: `Deposit for ${userId}`,
        metadata: {
          user_id: userId,
        },
      },
    },
    created: Math.floor(Date.now() / 1000),
  };
  
  const rawPayload = JSON.stringify(payload);
  const signature = generateStripeSignature(rawPayload, CONFIG.stripeSecret);
  
  try {
    const response = await axios.post(
      `${CONFIG.custodyFiatUrl}/webhooks/stripe`,
      payload,
      {
        headers: {
          'stripe-signature': signature,
          'content-type': 'application/json',
        },
        timeout: 10000,
      },
    );
    
    if ([200, 201, 202].includes(response.status)) {
      logSuccess('Webhook Stripe procesado correctamente');
      logInfo(`Usuario: ${userId}`);
      return { provider: 'stripe', userId, success: true };
    } else {
      logError(`Status inesperado: ${response.status}`);
      return { provider: 'stripe', userId, success: false };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logError('Firma inválida - verificar STRIPE_WEBHOOK_SECRET en .env');
    } else {
      logError(`Error: ${formatAxiosError(error)}`);
    }
    return { provider: 'stripe', userId, success: false };
  }
}

async function runWebhookTests() {
  log('\n🚀 Smoke Tests - Webhooks Reales de Providers', COLORS.cyan);
  log('=' .repeat(60), COLORS.cyan);

  const healthy = await checkCustodyFiatHealth();
  if (!healthy) {
    logError('Aborting: custody-fiat no está disponible');
    process.exit(1);
  }
  
  const results = [];
  
  // Test SPEI
  results.push(await testSpeiWebhook());
  
  // Test Mercado Pago (ruta canonical)
  results.push(await testMercadoPagoWebhook('mercadopago'));

  // Test Mercado Pago (alias)
  results.push(await testMercadoPagoWebhook('mp'));
  
  // Test Stripe
  results.push(await testStripeWebhook());
  
  // Resumen
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log('\n' + '='.repeat(60), COLORS.cyan);
  log('📊 Resumen', COLORS.cyan);
  log('=' .repeat(60), COLORS.cyan);
  logSuccess(`Tests exitosos: ${passed}/${results.length}`);
  if (failed > 0) {
    logError(`Tests fallidos: ${failed}/${results.length}`);
  }
  
  if (failed === 0) {
    log('\n✨ Todos los webhooks procesados correctamente!', COLORS.green);
    process.exit(0);
  } else {
    log('\n⚠️  Algunos webhooks fallaron - revisar logs', COLORS.cyan);
    process.exit(1);
  }
}

runWebhookTests().catch((error) => {
  logError(`Error: ${formatAxiosError(error)}`);
  process.exit(1);
});
