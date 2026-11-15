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

  const releaseOrderId = 'a1b2c3d4-aaaa-4def-cccc-aabbccddeeff';
  const releaseEscrowId = 'esc-release-test-fresh-001';
  const releaseDisputeId = 'f0e1d2c3-bbbb-4abc-dddd-001122334455';

  // Order para RELEASE
  const existingOrder = await db.collection('p2porders').findOne({ orderId: releaseOrderId });
  if (!existingOrder) {
    await db.collection('p2porders').insertOne({
      orderId: releaseOrderId,
      adId: 'ad-test-004',
      buyerId: 'p2p-buyer-004',
      sellerId: 'p2p-seller-004',
      assetCode: 'BTC',
      cryptoAmount: 0.001,
      fiatAmount: 500,
      fiatCurrency: 'MXN',
      fiatCode: 'MXN',
      price: 500000,
      paymentMethodId: 'pm-test-003',
      expiresAt: new Date(Date.now() + 86400000),
      status: 'DISPUTED',
      ledgerTxIds: [],
      buyerNote: '',
      sellerNote: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted RELEASE order:', releaseOrderId);
  }

  const existingEscrow = await db.collection('p2pescrows').findOne({ orderId: releaseOrderId });
  if (!existingEscrow) {
    await db.collection('p2pescrows').insertOne({
      escrowId: releaseEscrowId,
      orderId: releaseOrderId,
      holdId: 'test-hold-release-fresh-001',
      sellerId: 'p2p-seller-004',
      buyerId: 'p2p-buyer-004',
      assetCode: 'BTC',
      amount: 0.001,
      status: 'LOCKED',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted RELEASE escrow:', releaseEscrowId);
  }

  const existingDispute = await db.collection('p2pdisputes').findOne({ disputeId: releaseDisputeId });
  if (!existingDispute) {
    await db.collection('p2pdisputes').insertOne({
      disputeId: releaseDisputeId,
      orderId: releaseOrderId,
      openedByUserId: 'p2p-buyer-004',
      reason: 'Test RELEASE - paid but seller ghost',
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Inserted RELEASE dispute:', releaseDisputeId);
  }

  // Print all open disputes
  const open = await db.collection('p2pdisputes').find({ status: 'OPEN' }).toArray();
  console.log('Open disputes:', open.map(d => d.disputeId + ' -> orderId:' + d.orderId));

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
