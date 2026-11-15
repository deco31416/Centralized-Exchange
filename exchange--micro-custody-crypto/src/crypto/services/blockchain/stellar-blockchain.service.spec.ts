import { StellarBlockchainService } from './stellar-blockchain.service';

describe('StellarBlockchainService', () => {
  let service: StellarBlockchainService;

  beforeEach(() => {
    service = new StellarBlockchainService('testnet');
  });

  describe('connect', () => {
    it('should connect to Stellar testnet', async () => {
      await expect(service.connect()).resolves.not.toThrow();
      expect(service.isConnected()).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Stellar network', async () => {
      await service.connect();
      await service.disconnect();
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('isValidAddress', () => {
    it('should validate correct Stellar public keys', () => {
      const validAddresses = [
        'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
        'GADFVW3UXVKDOU626XUPYDJU2BFCGFJHQ6SREYOZ6IJV4XSHOALEQN2I',
        'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      ];

      for (const address of validAddresses) {
        expect(service.isValidAddress(address)).toBe(true);
      }
    });

    it('should reject invalid Stellar addresses', () => {
      const invalidAddresses = [
        'SBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H', // Starts with S (secret key)
        'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2', // Too short
        'invalid',
        '',
        '0x1234567890abcdef',
      ];

      for (const address of invalidAddresses) {
        expect(service.isValidAddress(address)).toBe(false);
      }
    });
  });

  describe('getHorizonUrl', () => {
    it('should return testnet Horizon URL', () => {
      expect(service.getHorizonUrl()).toBe('https://horizon-testnet.stellar.org');
    });

    it('should return mainnet Horizon URL for mainnet service', () => {
      const mainnetService = new StellarBlockchainService('mainnet');
      expect(mainnetService.getHorizonUrl()).toBe('https://horizon.stellar.org');
    });
  });

  describe('getNetworkPassphrase', () => {
    it('should return testnet network passphrase', () => {
      expect(service.getNetworkPassphrase()).toBe('Test SDF Network ; September 2015');
    });

    it('should return mainnet network passphrase for mainnet service', () => {
      const mainnetService = new StellarBlockchainService('mainnet');
      expect(mainnetService.getNetworkPassphrase()).toBe('Public Global Stellar Network ; September 2015');
    });
  });

  describe('estimateGasFee', () => {
    it('should return estimated fee in XLM', async () => {
      const mockTxParams = {
        to: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
        amount: 100,
        assetCode: 'XLM',
      };

      const feeEstimate = await service.estimateGasFee(mockTxParams);
      
      expect(feeEstimate.assetCode).toBe('XLM');
      expect(feeEstimate.fee).toBeGreaterThan(0);
      expect(feeEstimate.fee).toBeLessThan(0.001); // Stellar fees are very low
    });
  });

  // Note: Integration tests that actually call Stellar Horizon API
  // should be in separate e2e tests to avoid external dependencies
  // in unit tests
});
