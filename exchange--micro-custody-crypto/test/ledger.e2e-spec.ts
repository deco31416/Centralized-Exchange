import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { LedgerModule } from '../src/ledger/ledger.module';
import { OwnerType, AccountType } from '../src/ledger/models/account.schema';
import { LineDirection } from '../src/ledger/models/journal-line.schema';

describe('Ledger Module (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let userAccountId: string;
  let platformAccountId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUri), LedgerModule],
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

  describe('GET /ledger/test', () => {
    it('should return test message', () => {
      return request(app.getHttpServer())
        .get('/ledger/test')
        .expect(200)
        .expect({ message: 'Ledger controller is operational' });
    });
  });

  describe('POST /ledger/accounts', () => {
    it('should create a user liability account', () => {
      return request(app.getHttpServer())
        .post('/ledger/accounts')
        .send({
          ownerType: OwnerType.USER,
          ownerId: 'user123',
          assetCode: 'GIROD',
          accountType: AccountType.LIABILITY,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('_id');
          expect(response.body.ownerId).toBe('user123');
          expect(response.body.assetCode).toBe('GIROD');
          userAccountId = response.body._id;
        });
    });

    it('should create a platform asset account', () => {
      return request(app.getHttpServer())
        .post('/ledger/accounts')
        .send({
          ownerType: OwnerType.PLATFORM,
          ownerId: 'platform',
          assetCode: 'GIROD',
          accountType: AccountType.ASSET,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('_id');
          platformAccountId = response.body._id;
        });
    });

    it('should reject duplicate account', () => {
      return request(app.getHttpServer())
        .post('/ledger/accounts')
        .send({
          ownerType: OwnerType.USER,
          ownerId: 'user123',
          assetCode: 'GIROD',
          accountType: AccountType.LIABILITY,
        })
        .expect(409);
    });
  });

  describe('GET /ledger/accounts/:id', () => {
    it('should retrieve an account by ID', async () => {
      return request(app.getHttpServer())
        .get(`/ledger/accounts/${userAccountId}`)
        .expect(200)
        .then((response) => {
          expect(response.body._id).toBe(userAccountId);
          expect(response.body.ownerId).toBe('user123');
        });
    });

    it('should return 404 for non-existent account', () => {
      return request(app.getHttpServer())
        .get('/ledger/accounts/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('POST /ledger/entries', () => {
    it('should post a balanced journal entry', () => {
      return request(app.getHttpServer())
        .post('/ledger/entries')
        .send({
          externalIdempotencyKey: 'deposit-001',
          narration: 'Initial deposit',
          lines: [
            {
              accountId: platformAccountId,
              direction: LineDirection.DEBIT,
              amountMinor: 10000,
              assetCode: 'GIROD',
            },
            {
              accountId: userAccountId,
              direction: LineDirection.CREDIT,
              amountMinor: 10000,
              assetCode: 'GIROD',
            },
          ],
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('_id');
          expect(response.body.status).toBe('posted');
        });
    });

    it('should reject unbalanced entry', () => {
      return request(app.getHttpServer())
        .post('/ledger/entries')
        .send({
          externalIdempotencyKey: 'deposit-002',
          narration: 'Unbalanced entry',
          lines: [
            {
              accountId: platformAccountId,
              direction: LineDirection.DEBIT,
              amountMinor: 10000,
              assetCode: 'GIROD',
            },
            {
              accountId: userAccountId,
              direction: LineDirection.CREDIT,
              amountMinor: 5000,
              assetCode: 'GIROD',
            },
          ],
        })
        .expect(400);
    });

    it('should return existing entry for duplicate idempotency key', () => {
      return request(app.getHttpServer())
        .post('/ledger/entries')
        .send({
          externalIdempotencyKey: 'deposit-001',
          narration: 'Duplicate deposit',
          lines: [
            {
              accountId: platformAccountId,
              direction: LineDirection.DEBIT,
              amountMinor: 10000,
              assetCode: 'GIROD',
            },
            {
              accountId: userAccountId,
              direction: LineDirection.CREDIT,
              amountMinor: 10000,
              assetCode: 'GIROD',
            },
          ],
        })
        .expect(201)
        .then((response) => {
          expect(response.body.externalIdempotencyKey).toBe('deposit-001');
        });
    });
  });

  describe('GET /ledger/accounts/:id/balance', () => {
    it('should return account balance', () => {
      return request(app.getHttpServer())
        .get(`/ledger/accounts/${userAccountId}/balance?assetCode=GIROD`)
        .expect(200)
        .then((response) => {
          expect(response.body.balanceMinor).toBe(10000);
          expect(response.body.availableMinor).toBe(10000);
          expect(response.body.heldMinor).toBe(0);
        });
    });
  });

  describe('POST /ledger/holds', () => {
    let holdId: string;

    it('should create a hold', () => {
      return request(app.getHttpServer())
        .post('/ledger/holds')
        .send({
          accountId: userAccountId,
          amountMinor: 3000,
          reason: 'Escrow for P2P order',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('_id');
          expect(response.body.state).toBe('active');
          holdId = response.body._id;
        });
    });

    it('should reflect hold in available balance', () => {
      return request(app.getHttpServer())
        .get(`/ledger/accounts/${userAccountId}/balance?assetCode=GIROD`)
        .expect(200)
        .then((response) => {
          expect(response.body.balanceMinor).toBe(10000);
          expect(response.body.heldMinor).toBe(3000);
          expect(response.body.availableMinor).toBe(7000);
        });
    });

    it('should release a hold', () => {
      return request(app.getHttpServer())
        .post(`/ledger/holds/${holdId}/release`)
        .expect(201)
        .then((response) => {
          expect(response.body.state).toBe('released');
        });
    });

    it('should reflect released hold in available balance', () => {
      return request(app.getHttpServer())
        .get(`/ledger/accounts/${userAccountId}/balance?assetCode=GIROD`)
        .expect(200)
        .then((response) => {
          expect(response.body.availableMinor).toBe(10000);
          expect(response.body.heldMinor).toBe(0);
        });
    });
  });

  describe('Complete workflow: Deposit -> Transfer -> Withdrawal', () => {
    let secondUserAccountId: string;

    it('should create second user account', () => {
      return request(app.getHttpServer())
        .post('/ledger/accounts')
        .send({
          ownerType: OwnerType.USER,
          ownerId: 'user456',
          assetCode: 'GIROD',
          accountType: AccountType.LIABILITY,
        })
        .expect(201)
        .then((response) => {
          secondUserAccountId = response.body._id;
        });
    });

    it('should transfer funds between users', () => {
      return request(app.getHttpServer())
        .post('/ledger/entries')
        .send({
          externalIdempotencyKey: 'transfer-001',
          narration: 'User-to-user transfer',
          lines: [
            {
              accountId: userAccountId,
              direction: LineDirection.DEBIT,
              amountMinor: 2000,
              assetCode: 'GIROD',
            },
            {
              accountId: secondUserAccountId,
              direction: LineDirection.CREDIT,
              amountMinor: 2000,
              assetCode: 'GIROD',
            },
          ],
        })
        .expect(201);
    });

    it('should verify first user balance after transfer', () => {
      return request(app.getHttpServer())
        .get(`/ledger/accounts/${userAccountId}/balance?assetCode=GIROD`)
        .expect(200)
        .then((response) => {
          expect(response.body.balanceMinor).toBe(8000);
        });
    });

    it('should verify second user balance after transfer', () => {
      return request(app.getHttpServer())
        .get(`/ledger/accounts/${secondUserAccountId}/balance?assetCode=GIROD`)
        .expect(200)
        .then((response) => {
          expect(response.body.balanceMinor).toBe(2000);
        });
    });
  });
});
