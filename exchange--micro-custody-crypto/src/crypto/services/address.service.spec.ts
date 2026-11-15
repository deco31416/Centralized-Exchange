import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressService } from './address.service';
import { UserAddress } from '../models/user-address.schema';

describe('AddressService', () => {
  let service: AddressService;
  let model: Model<UserAddress>;

  // Helper to create a mock query that supports both direct resolution and .sort() chaining
  const createMockQuery = (resolveValue: any) => {
    const query = {
      sort: jest.fn().mockResolvedValue(resolveValue),
    };
    // Make the query itself a thenable that resolves to the value
    Object.assign(query, {
      then: (onFulfilled: any) => Promise.resolve(resolveValue).then(onFulfilled),
      catch: (onRejected: any) => Promise.resolve(resolveValue).catch(onRejected),
    });
    return query;
  };

  const mockAddressModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  }));
  
  mockAddressModel.findOne = jest.fn();
  mockAddressModel.find = jest.fn();
  mockAddressModel.create = jest.fn();
  mockAddressModel.findByIdAndUpdate = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getModelToken(UserAddress.name),
          useValue: mockAddressModel,
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    model = module.get<Model<UserAddress>>(getModelToken(UserAddress.name));

    // Set environment variables for testing
    process.env.HD_WALLET_SEED =
      'a'.repeat(64); // Mock seed (32 bytes hex)
    process.env.BSC_NETWORK = 'testnet';
    process.env.BTC_NETWORK = 'testnet';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAddressForUser', () => {
    it('should return existing address if already generated', async () => {
      const existingAddress = {
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
        address: '0x1234567890abcdef',
        derivationPath: "m/44'/60'/0'/0/0",
        addressIndex: 0,
      };

      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(existingAddress));

      const result = await service.generateAddressForUser({
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
      });

      expect(result).toEqual(existingAddress);
      expect(mockAddressModel.findOne).toHaveBeenCalledWith({
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
      });
    });

    it('should generate new BSC address if not exists', async () => {
      // First call: no existing address
      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(null));
      
      // Second call: no previous addresses (for getNextAddressIndex)
      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(null));

      const mockAddress = {
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
        address: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
        derivationPath: expect.any(String),
        addressIndex: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(mockAddressModel, 'constructor').mockReturnValue(mockAddress as any);

      const result = await service.generateAddressForUser({
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
      });

      expect(result.userId).toBe('user123');
      expect(result.blockchain).toBe('bsc');
    });

    it('should throw error if HD_WALLET_SEED not configured', async () => {
      delete process.env.HD_WALLET_SEED;
      
      // First call: no existing address
      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(null));
      
      // Second call: no previous addresses
      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(null));

      await expect(
        service.generateAddressForUser({
          userId: 'user123',
          blockchain: 'bsc',
          assetCode: 'BNB',
        }),
      ).rejects.toThrow('HD_WALLET_SEED not configured');
    });
  });

  describe('getUserAddresses', () => {
    it('should return all addresses for a user', async () => {
      const addresses = [
        { userId: 'user123', blockchain: 'bsc', assetCode: 'BNB' },
        { userId: 'user123', blockchain: 'bitcoin', assetCode: 'BTC' },
      ];

      mockAddressModel.find.mockResolvedValue(addresses);

      const result = await service.getUserAddresses('user123');

      expect(result).toEqual(addresses);
      expect(mockAddressModel.find).toHaveBeenCalledWith({
        userId: 'user123',
        isActive: true,
      });
    });
  });

  describe('getUserAddress', () => {
    it('should return specific address for user', async () => {
      const address = {
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
        address: '0xabcdef',
      };

      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(address));

      const result = await service.getUserAddress('user123', 'bsc', 'BNB');

      expect(result).toEqual(address);
      expect(mockAddressModel.findOne).toHaveBeenCalledWith({
        userId: 'user123',
        blockchain: 'bsc',
        assetCode: 'BNB',
        isActive: true,
      });
    });

    it('should return null if address not found', async () => {
      mockAddressModel.findOne.mockReturnValueOnce(createMockQuery(null));

      const result = await service.getUserAddress('user123', 'bsc', 'BNB');

      expect(result).toBeNull();
    });
  });

  describe('updateDepositStats', () => {
    it('should update address deposit statistics', async () => {
      mockAddressModel.findByIdAndUpdate.mockResolvedValue(true);

      await service.updateDepositStats('address123', 1.5);

      expect(mockAddressModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'address123',
        {
          lastDepositAt: expect.any(Date),
          $inc: { totalDepositsReceived: 1.5 },
        },
      );
    });
  });
});
