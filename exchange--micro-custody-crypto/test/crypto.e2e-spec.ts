import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { CryptoModule } from '../src/crypto/crypto.module';

describe('CryptoModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-test',
        ),
        BullModule.forRoot({
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
        }),
        CryptoModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/crypto/addresses (POST)', () => {
    it('should generate a new BSC deposit address', () => {
      return request(app.getHttpServer())
        .post('/crypto/addresses/generate')
        .send({
          blockchain: 'bsc',
          assetCode: 'BNB',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('address');
          expect(res.body.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
          expect(res.body.blockchain).toBe('bsc');
          expect(res.body.assetCode).toBe('BNB');
        });
    });

    it('should return existing address if already generated', async () => {
      // First request
      const firstResponse = await request(app.getHttpServer())
        .post('/crypto/addresses/generate')
        .send({
          blockchain: 'bsc',
          assetCode: 'BNB',
        });

      // Second request with same params
      const secondResponse = await request(app.getHttpServer())
        .post('/crypto/addresses/generate')
        .send({
          blockchain: 'bsc',
          assetCode: 'BNB',
        });

      expect(firstResponse.body.address).toBe(secondResponse.body.address);
    });
  });

  describe('/crypto/addresses (GET)', () => {
    it('should return all user addresses', () => {
      return request(app.getHttpServer())
        .get('/crypto/addresses')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/crypto/deposits (GET)', () => {
    it('should return user deposit history', () => {
      return request(app.getHttpServer())
        .get('/crypto/deposits')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter deposits by asset code', () => {
      return request(app.getHttpServer())
        .get('/crypto/deposits?assetCode=BTC')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // All results should have assetCode BTC
          res.body.forEach((deposit: any) => {
            expect(deposit.assetCode).toBe('BTC');
          });
        });
    });
  });

  describe('/crypto/withdrawals (POST)', () => {
    it('should request a withdrawal', () => {
      const idempotencyKey = `test_withdrawal_${Date.now()}`;

      return request(app.getHttpServer())
        .post('/crypto/withdrawals')
        .send({
          assetCode: 'BNB',
          amount: 0.1,
          destinationAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb27',
          idempotencyKey,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('assetCode');
          expect(res.body.assetCode).toBe('BNB');
          expect(res.body.amount).toBe(0.1);
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should reject withdrawal with invalid address', () => {
      return request(app.getHttpServer())
        .post('/crypto/withdrawals')
        .send({
          assetCode: 'BNB',
          amount: 0.1,
          destinationAddress: 'invalid_address',
          idempotencyKey: `test_invalid_${Date.now()}`,
        })
        .expect(400);
    });

    it('should return existing withdrawal for duplicate idempotency key', async () => {
      const idempotencyKey = `test_duplicate_${Date.now()}`;

      const firstResponse = await request(app.getHttpServer())
        .post('/crypto/withdrawals')
        .send({
          assetCode: 'BNB',
          amount: 0.1,
          destinationAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb27',
          idempotencyKey,
        });

      const secondResponse = await request(app.getHttpServer())
        .post('/crypto/withdrawals')
        .send({
          assetCode: 'BNB',
          amount: 0.1,
          destinationAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb27',
          idempotencyKey,
        });

      expect(firstResponse.body._id).toBe(secondResponse.body._id);
    });
  });

  describe('/crypto/withdrawals (GET)', () => {
    it('should return user withdrawal history', () => {
      return request(app.getHttpServer())
        .get('/crypto/withdrawals')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/crypto/admin/custody/balances (GET)', () => {
    it('should return custody wallet balances', () => {
      return request(app.getHttpServer())
        .get('/crypto/admin/custody/balances')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/crypto/admin/watchtower/status (GET)', () => {
    it('should return watchtower status', () => {
      return request(app.getHttpServer())
        .get('/crypto/admin/watchtower/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('isRunning');
          expect(res.body).toHaveProperty('activeWatchers');
          expect(Array.isArray(res.body.activeWatchers)).toBe(true);
        });
    });
  });

  describe('/crypto/multisig/requests (GET)', () => {
    it('should return pending multi-sig requests', () => {
      return request(app.getHttpServer())
        .get('/crypto/multisig/requests')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
