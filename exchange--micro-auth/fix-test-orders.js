const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

loadEnvLocal();

const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
if (!mongoUrl) {
  console.error('MONGO_URL or MONGODB_URI is required in .env.local');
  process.exit(1);
}

mongoose.connect(mongoUrl).then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('p2porders');

  const r1 = await col.updateOne(
    { orderId: '595dbb36-acde-44d8-9e06-06563da478bd' },
    { $set: { expiresAt: new Date(Date.now() + 86400000), paymentMethodId: 'pm-test-001', price: 500000, fiatCode: 'MXN' } }
  );
  console.log('595 updated:', r1.modifiedCount);

  const r2 = await col.updateOne(
    { orderId: '7d988d6e-a07e-49a5-8f5e-3b0823af1234' },
    { $set: { expiresAt: new Date(Date.now() + 86400000), paymentMethodId: 'pm-test-001', price: 500000, fiatCode: 'MXN' } }
  );
  console.log('7d9 updated:', r2.modifiedCount);

  // Estado del escrow para 595 (fue releaseCrypto-d en custody pero puede que doc siga LOCKED)
  const esc = await db.collection('p2pescrows').findOne({ orderId: '595dbb36-acde-44d8-9e06-06563da478bd' });
  console.log('Escrow 595 status in Mongo:', esc ? esc.status : 'NOT FOUND', '| escrowId:', esc ? esc.escrowId : '-');

  // Insertar un tercer order + escrow para REFUND test (freshly DISPUTED, escrow LOCKED)
  const refundOrderId = 'c3a1b2d4-ffff-4abc-bbbb-001122334455';
  const refundEscrowId = 'esc-refund-test-00001';
  const existingOrder = await col.findOne({ orderId: refundOrderId });
  if (!existingOrder) {
    await col.insertOne({
      orderId: refundOrderId,
      adId: 'ad-test-003',
      buyerId: 'p2p-buyer-003',
      sellerId: 'p2p-seller-003',
      assetCode: 'BTC',
      cryptoAmount: 0.001,
      fiatAmount: 500,
      fiatCurrency: 'MXN',
      fiatCode: 'MXN',
      price: 500000,
      paymentMethodId: 'pm-test-002',
      expiresAt: new Date(Date.now() + 86400000),
      status: 'DISPUTED',
      ledgerTxIds: [],
      buyerNote: '',
      sellerNote: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted fresh order for REFUND:', refundOrderId);
  } else {
    console.log('REFUND order already exists');
  }

  const existingEscrow = await db.collection('p2pescrows').findOne({ orderId: refundOrderId });
  if (!existingEscrow) {
    await db.collection('p2pescrows').insertOne({
      escrowId: refundEscrowId,
      orderId: refundOrderId,
      holdId: 'test-hold-refund-001',
      sellerId: 'p2p-seller-003',
      buyerId: 'p2p-buyer-003',
      assetCode: 'BTC',
      amount: 0.001,
      status: 'LOCKED',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted fresh escrow for REFUND:', refundEscrowId);
  } else {
    console.log('REFUND escrow already exists, status:', existingEscrow.status);
  }

  // Insertar dispute para el REFUND order
  const refundDisputeId = 'd9e8f7a6-1111-4bcd-aaaa-112233445566';
  const existingDispute = await db.collection('p2pdisputes').findOne({ disputeId: refundDisputeId });
  if (!existingDispute) {
    await db.collection('p2pdisputes').insertOne({
      disputeId: refundDisputeId,
      orderId: refundOrderId,
      openedByUserId: 'p2p-buyer-003',
      reason: 'Test REFUND - seller did not deliver crypto',
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted fresh dispute for REFUND:', refundDisputeId);
  } else {
    console.log('REFUND dispute already exists');
  }

  mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });

function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const clean = line.trim();
    if (!clean || clean.startsWith('#') || !clean.includes('=')) continue;
    const index = clean.indexOf('=');
    const key = clean.slice(0, index).trim();
    const rawValue = clean.slice(index + 1).trim();
    if (!key || process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}
