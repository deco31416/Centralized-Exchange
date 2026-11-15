import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { SwapModule } from '../src/swap/swap.module';
import { LedgerModule } from '../src/ledger/ledger.module';
import { ConfigModule } from '@nestjs/config';
import { OwnerType, AccountType } from '../src/ledger/models/account.schema';
import { LineDirection } from '../src/ledger/models/journal-line.schema';

describe('Swap Module (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        LedgerModule,
        SwapModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  }, 30000);

  describe('/swap/quote (POST)', () => {
    it('should return a quote with fromAmount specified', () => {
      return request(app.getHttpServer())
        .post('/swap/quote')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('quoteId');
          expect(res.body.fromAsset).toBe('USD');
          expect(res.body.toAsset).toBe('BTC');
          expect(res.body.fromAmount).toBe(1000);
          expect(res.body).toHaveProperty('toAmount');
          expect(res.body).toHaveProperty('rate');
          expect(res.body).toHaveProperty('spread');
          expect(res.body).toHaveProperty('pricingBand');
          expect(res.body).toHaveProperty('expiresAt');
        });
    });

    it('should return a quote with toAmount specified', () => {
      return request(app.getHttpServer())
        .post('/swap/quote')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
          toAmount: 0.02,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('quoteId');
          expect(res.body.toAmount).toBe(0.02);
          expect(res.body).toHaveProperty('fromAmount');
        });
    });

    it('should reject quote with neither fromAmount nor toAmount', () => {
      return request(app.getHttpServer())
        .post('/swap/quote')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
        })
        .expect(400);
    });
  });

  describe('/swap/execute (POST)', () => {
    it('should fail swap due to insufficient balance initially', () => {
      return request(app.getHttpServer())
        .post('/swap/execute')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          idempotencyKey: `swap_${Date.now()}_1`,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Insufficient balance');
        });
    });

    it('should reject swap with duplicate idempotency key', async () => {
      const idempotencyKey = `swap_${Date.now()}_duplicate`;

      // First swap (will fail due to balance but will be created)
      await request(app.getHttpServer())
        .post('/swap/execute')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          idempotencyKey,
        })
        .expect(400);

      // Second swap with same key
      await request(app.getHttpServer())
        .post('/swap/execute')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 2000,
          idempotencyKey,
        })
        .expect(409); // Conflict
    });
  });

  describe('/swap/history (GET)', () => {
    it('should return empty history initially', () => {
      return request(app.getHttpServer())
        .get('/swap/history')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('swaps');
          expect(Array.isArray(res.body.swaps)).toBe(true);
        });
    });

    it('should accept limit query parameter', () => {
      return request(app.getHttpServer())
        .get('/swap/history?limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('swaps');
        });
    });
  });

  describe('/swap/admin/reserves (GET)', () => {
    it('should return all platform reserves', () => {
      return request(app.getHttpServer())
        .get('/swap/admin/reserves')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('reserves');
          expect(Array.isArray(res.body.reserves)).toBe(true);
        });
    });
  });

  describe('Integration: Full swap flow with setup', () => {
    it('should execute swap successfully with proper setup', async () => {
      // Setup: Create user accounts and fund with initial balance
      const AccountService = app.get('AccountService');
      const PostingService = app.get('PostingService');
      const PlatformReservesService = app.get('PlatformReservesService');

      const userId = 'test-user-integration';

      // Create user USD account
      const userUsdAccount = await AccountService.getOrCreateAccount({
        ownerType: OwnerType.USER,
        ownerId: userId,
        assetCode: 'USD',
        accountType: AccountType.ASSET,
      });

      // Create platform accounts
      const platformUsdAccount = await AccountService.getOrCreateAccount({
        ownerType: OwnerType.PLATFORM,
        ownerId: 'PLATFORM',
        assetCode: 'USD',
        accountType: AccountType.ASSET,
      });

      const platformBtcAccount = await AccountService.getOrCreateAccount({
        ownerType: OwnerType.PLATFORM,
        ownerId: 'PLATFORM',
        assetCode: 'BTC',
        accountType: AccountType.ASSET,
      });

      // Fund user with 10,000 USD
      await PostingService.postJournalEntry({
        externalIdempotencyKey: `fund_user_${Date.now()}`,
        narration: 'Fund user for testing',
        lines: [
          {
            accountId: String(platformUsdAccount._id),
            direction: LineDirection.DEBIT,
            amountMinor: 1000000, // 10,000 USD in cents
            assetCode: 'USD',
          },
          {
            accountId: String(userUsdAccount._id),
            direction: LineDirection.CREDIT,
            amountMinor: 1000000,
            assetCode: 'USD',
          },
        ],
      });

      // Setup platform reserves
      await PlatformReservesService.createReserve({
        assetCode: 'BTC',
        virtualBalance: 10,
        realBalance: 10,
        exposureLimit: 100,
      });

      await PlatformReservesService.createReserve({
        assetCode: 'USD',
        virtualBalance: 1000000,
        realBalance: 1000000,
        exposureLimit: 10000000,
      });

      // Now execute swap
      const swapResponse = await request(app.getHttpServer())
        .post('/swap/execute')
        .send({
          fromAsset: 'USD',
          toAsset: 'BTC',
          fromAmount: 1000,
          idempotencyKey: `swap_integration_${Date.now()}`,
        })
        .expect(201);

      expect(swapResponse.body).toHaveProperty('swapId');
      expect(swapResponse.body.status).toBe('executed');
      expect(swapResponse.body.fromAmount).toBe(1000);
      expect(swapResponse.body).toHaveProperty('toAmount');
      expect(swapResponse.body).toHaveProperty('ledgerEntryId');

      // Verify balances changed
      const BalanceService = app.get('BalanceService');
      const usdBalance = await BalanceService.getAccountBalance({
        accountId: String(userUsdAccount._id),
        assetCode: 'USD',
      });

      expect(usdBalance.balanceMinor).toBeLessThan(1000000); // Should have decreased (in minor units)
    });
  });
});
