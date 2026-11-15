# Database Seed Script

This directory contains the database seeding script for the micro-ng-custody system.

## What Does It Seed?

The seed script populates the database with test data for all three modules:

### 1. Ledger Module
- **Platform Accounts**: Creates platform reserve accounts for USD, BTC, ETH, BSS, and USDT
- **User Accounts**: Creates accounts for 3 test users (user1, user2, user3) for all assets
- **Initial Funding**: Funds all test users with initial balances:
  - USD: $10,000
  - BTC: 2 BTC
  - ETH: 10 ETH
  - BSS: 1,000,000 BSS
  - USDT: 5,000 USDT

### 2. Pricing Module
- **Price Providers**: Creates mock providers (Binance, Coinbase, Banco Central de Venezuela)
- **Exchange Rates**: Seeds initial rates for all asset pairs
- **Pricing Configurations**: Creates spread configurations for:
  - USD/BTC, BTC/USD (2% spread each side - Green band ✅)
  - USD/ETH, ETH/USD (2% spread each side - Green band ✅)
  - BTC/ETH, ETH/BTC (1.5% spread each side - Green band ✅)
  - USD/USDT, USDT/USD (0.5% spread each side - Green band ✅)
  - USD/BSS, BSS/USD (3% spread each side - Green band ✅)
  - And more cross-pairs

### 3. Swap Module
- **Platform Reserves**: Creates reserves with coverage ratios:
  - USD: $1,000,000 (exposure limit: $100k)
  - BTC: 50 BTC (exposure limit: 10 BTC)
  - ETH: 500 ETH (exposure limit: 100 ETH)
  - BSS: 50,000,000 BSS (exposure limit: 5M BSS)
  - USDT: $500,000 USDT (exposure limit: $50k)

## Usage

### Prerequisites

1. **MongoDB Running**: Make sure MongoDB is running on `localhost:27017` or set `MONGODB_URI` in your `.env` file
2. **Dependencies Installed**: Run `pnpm install`

### Run the Seed Script

```bash
# Using pnpm (recommended)
pnpm seed

# Or using npm
npm run seed
```

### What to Expect

The script will output detailed logs showing:
- ✅ Successfully created items
- ⚠️  Warnings for items that already exist (safe to ignore)
- ❌ Errors if something fails

Example output:
```
🌱 Starting database seed...

📒 Seeding Ledger Accounts...
  ✅ Created platform account for USD: 507f1f77bcf86cd799439011
  ✅ Created platform account for BTC: 507f1f77bcf86cd799439012
  ...

💰 Funding Test Accounts...
  ✅ Funded user1 with 10000 USD
  ✅ Funded user1 with 2 BTC
  ...

💹 Seeding Price Providers...
  ✅ Created price provider: binance
  ...

✨ Seed completed successfully!
```

## Idempotency

The seed script is **idempotent**, meaning:
- ✅ Safe to run multiple times
- ✅ Won't create duplicates
- ✅ Will skip items that already exist
- ✅ Only creates missing data

## After Seeding

Once the seed is complete, you can:

### 1. Test Swaps
```bash
POST http://localhost:3000/swap/quote
{
  "fromAsset": "USD",
  "toAsset": "BTC",
  "fromAmount": 1000
}
```

```bash
POST http://localhost:3000/swap/execute
{
  "fromAsset": "USD",
  "toAsset": "BTC",
  "fromAmount": 1000,
  "idempotencyKey": "unique-key-123"
}
```

### 2. Check Balances
```bash
# Get user1's USD account
GET http://localhost:3000/ledger/accounts/{accountId}/balance?assetCode=USD
```

### 3. View Pricing Configurations
```bash
GET http://localhost:3000/pricing/configurations
```

### 4. Check Platform Reserves
```bash
GET http://localhost:3000/swap/admin/reserves
```

## Test Users

After seeding, you'll have 3 test users ready to use:

- **user1**: Fully funded in all assets
- **user2**: Fully funded in all assets
- **user3**: Fully funded in all assets

Each user has accounts and balances for:
- USD, BTC, ETH, BSS, USDT

## Customization

To customize the seed data, edit `scripts/seed.ts`:

- **Change initial funding amounts**: Modify the `initialFunding` object
- **Add more assets**: Add to the `assets` array
- **Add more test users**: Add to the `testUsers` array
- **Adjust spreads**: Modify the `pricingConfigs` array
- **Change reserve amounts**: Modify the `reserves` array

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running:
```bash
# Start MongoDB
sudo systemctl start mongod

# Or with Docker
docker run -d -p 27017:27017 mongo:latest
```

### "Already exists" Warnings
```
⚠️  Platform account for USD already exists, skipping
```
**Solution**: This is normal and safe. The script detects existing data and skips it.

### Compilation Errors
```
Error: Cannot find module '@nestjs/core'
```
**Solution**: Install dependencies:
```bash
pnpm install
```

## Clean Database (Optional)

If you want to start fresh, you can drop the database:

```bash
# Using MongoDB CLI
mongo custody-ledger --eval "db.dropDatabase()"

# Or using MongoDB Compass
# Connect to localhost:27017
# Right-click "custody-ledger" database → Drop Database
```

Then run the seed script again:
```bash
pnpm seed
```

## Production Warning

⚠️ **DO NOT run this seed script in production!**

This script is for **development and testing only**. It creates:
- Test users with predictable IDs
- Mock price providers
- Artificial funding transactions

For production, you should:
1. Create accounts through proper onboarding flows
2. Use real price provider integrations
3. Fund accounts through actual deposit mechanisms
4. Configure spreads based on business requirements

## Questions?

Check the module documentation:
- [1.LEDGER-DOCUMENTATION.md](../1.LEDGER-DOCUMENTATION.md)
- [2.SWAP-DOCUMENTATION.md](../2.SWAP-DOCUMENTATION.md)
- [3.PRICING-DOCUMENTATION.md](../3.PRICING-DOCUMENTATION.md)
