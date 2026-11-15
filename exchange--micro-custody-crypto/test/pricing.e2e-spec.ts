import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingModule } from '../src/pricing/pricing.module';
import { ConfigModule } from '@nestjs/config';
import { PricingBand } from '../src/pricing/models/pricing-configuration.schema';

describe('Pricing Module (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(mongoUri),
        PricingModule,
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

    // Create a mock provider for testing
    await request(app.getHttpServer())
      .post('/pricing/oracle/providers')
      .send({
        name: 'test-provider',
        type: 'aggregator',
        assetPairs: ['USD/BTC', 'BTC/USD', 'USD/ETH', 'ETH/USD', 'USD/BSS', 'USD/EUR'],
        weight: 1.0,
        endpoint: 'http://test.com',
      });
  }, 30000);

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  }, 30000);

  describe('Pricing Configuration Endpoints', () => {
    let configId: string;

    it('POST /pricing/configurations - should create a new pricing configuration', async () => {
      const response = await request(app.getHttpServer())
        .post('/pricing/configurations')
        .send({
          assetPair: 'USD/BSS',
          buySpread: 2.7,
          sellSpread: 2.7,
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.assetPair).toBe('USD/BSS');
      expect(response.body.totalSpread).toBe(5.4);
      expect(response.body.currentBand).toBe(PricingBand.GREEN);
      
      configId = response.body._id;
    });

    it('POST /pricing/configurations - should reject duplicate asset pair', async () => {
      await request(app.getHttpServer())
        .post('/pricing/configurations')
        .send({
          assetPair: 'USD/BSS',
          buySpread: 3.0,
          sellSpread: 3.0,
        })
        .expect(409); // Conflict
    });

    it('POST /pricing/configurations - should reject red band spreads', async () => {
      await request(app.getHttpServer())
        .post('/pricing/configurations')
        .send({
          assetPair: 'USD/BTC',
          buySpread: 8.0,
          sellSpread: 8.0,
        })
        .expect(400);
    });

    it('GET /pricing/configurations/:id - should get configuration by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pricing/configurations/${configId}`)
        .expect(200);

      expect(response.body.assetPair).toBe('USD/BSS');
    });

    it('GET /pricing/configurations/pair - should get configuration by asset pair', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/configurations/pair?assetPair=USD/BSS')
        .expect(200);

      expect(response.body.assetPair).toBe('USD/BSS');
    });

    it('GET /pricing/configurations - should get all configurations', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/configurations')
        .expect(200);

      expect(response.body.configurations).toBeInstanceOf(Array);
      expect(response.body.configurations.length).toBeGreaterThan(0);
    });

    it('PUT /pricing/configurations/:id/spreads - should update spreads', async () => {
      const response = await request(app.getHttpServer())
        .put(`/pricing/configurations/${configId}/spreads`)
        .send({
          buySpread: 3.0,
          sellSpread: 3.0,
        })
        .expect(200);

      expect(response.body.buySpread).toBe(3.0);
      expect(response.body.totalSpread).toBe(6.0);
    });

    it('PUT /pricing/configurations/:id/spreads - should require justification for yellow band', async () => {
      await request(app.getHttpServer())
        .put(`/pricing/configurations/${configId}/spreads`)
        .send({
          buySpread: 6.0,
          sellSpread: 6.0,
        })
        .expect(400);
    });

    it('PUT /pricing/configurations/:id/spreads - should accept yellow band with justification', async () => {
      const response = await request(app.getHttpServer())
        .put(`/pricing/configurations/${configId}/spreads`)
        .send({
          buySpread: 6.0,
          sellSpread: 6.0,
          justification: 'High market volatility during economic crisis',
        })
        .expect(200);

      expect(response.body.currentBand).toBe(PricingBand.YELLOW);
      expect(response.body.requiresJustification).toBe(true);
    });

    it('POST /pricing/configurations/:id/approve - should approve yellow band', async () => {
      const response = await request(app.getHttpServer())
        .post(`/pricing/configurations/${configId}/approve`)
        .send({
          approvedBy: 'xxxxx--xxxxx@example.invalid',
          justification: 'Approved due to market conditions',
        })
        .expect(201);

      expect(response.body.approvedBy).toBe('xxxxx--xxxxx@example.invalid');
    });

    it('PUT /pricing/configurations/:id/toggle - should toggle enabled status', async () => {
      const response = await request(app.getHttpServer())
        .put(`/pricing/configurations/${configId}/toggle`)
        .send({ enabled: false })
        .expect(200);

      expect(response.body.enabled).toBe(false);
    });

    it('DELETE /pricing/configurations/:id - should delete configuration', async () => {
      await request(app.getHttpServer())
        .delete(`/pricing/configurations/${configId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/pricing/configurations/${configId}`)
        .expect(404);
    });
  });

  describe('Price Oracle Endpoints', () => {
    it('GET /pricing/oracle/rate - should get exchange rate', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/oracle/rate?from=USD&to=BTC')
        .expect(200);

      expect(response.body).toHaveProperty('rate');
      expect(response.body.rate).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('GET /pricing/oracle/rate - should return cached rate on second call', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/pricing/oracle/rate?from=USD&to=ETH')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/pricing/oracle/rate?from=USD&to=ETH')
        .expect(200);

      expect(response1.body.rate).toBe(response2.body.rate);
      expect(response2.body.cached).toBe(true);
    });

    it('GET /pricing/oracle/providers - should get all providers', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/oracle/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(response.body.providers).toBeInstanceOf(Array);
    });
  });

  describe('Compliance Endpoints', () => {
    beforeEach(async () => {
      // Create a yellow band config for compliance testing
      await request(app.getHttpServer())
        .post('/pricing/configurations')
        .send({
          assetPair: 'USD/EUR',
          buySpread: 6.0,
          sellSpread: 6.0,
        })
        .send({
          justification: 'Test yellow band',
        });
    });

    it('GET /pricing/compliance/alerts - should get active alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/compliance/alerts')
        .expect(200);

      expect(response.body).toHaveProperty('alerts');
      expect(response.body.alerts).toBeInstanceOf(Array);
    });

    it('GET /pricing/compliance/stats - should get compliance statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/compliance/stats?days=30')
        .expect(200);

      expect(response.body).toHaveProperty('totalOperations');
      expect(response.body).toHaveProperty('bandDistribution');
      expect(response.body.bandDistribution).toHaveProperty('green');
      expect(response.body.bandDistribution).toHaveProperty('yellow');
      expect(response.body.bandDistribution).toHaveProperty('red');
    });

    it('GET /pricing/compliance/reports/daily - should generate daily report', async () => {
      const response = await request(app.getHttpServer())
        .get('/pricing/compliance/reports/daily?date=2025-10-01')
        .expect(200);

      expect(response.body).toHaveProperty('reportId');
      expect(response.body).toHaveProperty('period');
      expect(response.body).toHaveProperty('totalPricingOperations');
      expect(response.body).toHaveProperty('operationsByBand');
    });
  });

  describe('Integration Flow: Create -> Update -> Apply Spread -> Compliance', () => {
    it('should complete full pricing lifecycle', async () => {
      // 1. Create configuration
      const createRes = await request(app.getHttpServer())
        .post('/pricing/configurations')
        .send({
          assetPair: 'BTC/USD',
          buySpread: 2.5,
          sellSpread: 2.5,
        })
        .expect(201);

      const configId = createRes.body._id;
      expect(createRes.body.currentBand).toBe(PricingBand.GREEN);

      // 2. Get rate from oracle
      const rateRes = await request(app.getHttpServer())
        .get('/pricing/oracle/rate?from=BTC&to=USD')
        .expect(200);

      expect(rateRes.body.rate).toBeGreaterThan(0);

      // 3. Update to yellow band
      await request(app.getHttpServer())
        .put(`/pricing/configurations/${configId}/spreads`)
        .send({
          buySpread: 6.5,
          sellSpread: 6.5,
          justification: 'Market volatility',
        })
        .expect(200);

      // 4. Check compliance alerts
      const alertsRes = await request(app.getHttpServer())
        .get('/pricing/compliance/alerts')
        .expect(200);

      // Should have alerts (configuration might need review)
      expect(alertsRes.body.alerts).toBeInstanceOf(Array);

      // 5. Get logs
      const logsRes = await request(app.getHttpServer())
        .get(`/pricing/logs/${configId}?limit=10`)
        .expect(200);

      expect(logsRes.body.logs).toBeInstanceOf(Array);

      // 6. Clean up
      await request(app.getHttpServer())
        .delete(`/pricing/configurations/${configId}`)
        .expect(200);
    });
  });
});