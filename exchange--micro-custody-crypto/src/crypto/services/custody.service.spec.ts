import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustodyService } from './custody.service';
import { CustodyWallet } from '../models/custody-wallet.schema';

describe('CustodyService', () => {
  let service: CustodyService;

  const mockCustodyWalletModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue(dto),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustodyService,
        {
          provide: getModelToken(CustodyWallet.name),
          useValue: mockCustodyWalletModel,
        },
      ],
    }).compile();

    service = module.get<CustodyService>(CustodyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWallet', () => {
    it('should return custody wallet for asset', async () => {
      const wallet = {
        assetCode: 'BTC',
        blockchain: 'bitcoin',
        mainAddress: 'bc1q...',
        balance: 10,
        isActive: true,
      };

      mockCustodyWalletModel.findOne.mockResolvedValue(wallet);

      const result = await service.getWallet('BTC');

      expect(result).toEqual(wallet);
      expect(mockCustodyWalletModel.findOne).toHaveBeenCalledWith({
        assetCode: 'BTC',
        isActive: true,
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue(null);

      await expect(service.getWallet('BTC')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateWithdrawalLimits', () => {
    const mockWallet = {
      assetCode: 'BTC',
      isActive: true,
      isLocked: false,
      balance: 100,
      maxWithdrawalPerTx: 10,
      maxWithdrawalPerHour: 50,
      maxWithdrawalPerDay: 200,
      currentHourWithdrawals: 0,
      currentDayWithdrawals: 0,
      minOperationalBalance: 5,
    };

    it('should pass validation for valid withdrawal', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue(mockWallet);

      await expect(
        service.validateWithdrawalLimits('BTC', 5),
      ).resolves.not.toThrow();
    });

    it('should throw error if wallet is locked', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue({
        ...mockWallet,
        isLocked: true,
      });

      await expect(service.validateWithdrawalLimits('BTC', 5)).rejects.toThrow(
        'Wallet for BTC is locked',
      );
    });

    it('should throw error if amount exceeds per-transaction limit', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue(mockWallet);

      await expect(
        service.validateWithdrawalLimits('BTC', 15),
      ).rejects.toThrow('exceeds maximum per transaction');
    });

    it('should throw error if hourly limit would be exceeded', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue({
        ...mockWallet,
        currentHourWithdrawals: 45,
      });

      await expect(service.validateWithdrawalLimits('BTC', 10)).rejects.toThrow(
        'Hourly withdrawal limit exceeded',
      );
    });

    it('should throw error if daily limit would be exceeded', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue({
        ...mockWallet,
        currentDayWithdrawals: 195,
      });

      await expect(service.validateWithdrawalLimits('BTC', 10)).rejects.toThrow(
        'Daily withdrawal limit exceeded',
      );
    });

    it('should throw error if insufficient balance', async () => {
      mockCustodyWalletModel.findOne.mockResolvedValue({
        ...mockWallet,
        balance: 2,
      });

      await expect(service.validateWithdrawalLimits('BTC', 5)).rejects.toThrow(
        'Insufficient hot wallet balance',
      );
    });
  });

  describe('incrementWithdrawalCounter', () => {
    it('should increment withdrawal counters', async () => {
      const mockWallet = {
        assetCode: 'BTC',
        currentHourWithdrawals: 5,
        currentDayWithdrawals: 20,
        withdrawalWindowReset: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        save: jest.fn().mockResolvedValue(true),
      };

      mockCustodyWalletModel.findOne.mockResolvedValue(mockWallet);

      await service.incrementWithdrawalCounter('BTC', 2);

      expect(mockWallet.currentHourWithdrawals).toBe(7);
      expect(mockWallet.currentDayWithdrawals).toBe(22);
      expect(mockWallet.save).toHaveBeenCalled();
    });

    it('should reset counters after 24 hours', async () => {
      const mockWallet = {
        assetCode: 'BTC',
        currentHourWithdrawals: 50,
        currentDayWithdrawals: 200,
        withdrawalWindowReset: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        save: jest.fn().mockResolvedValue(true),
      };

      mockCustodyWalletModel.findOne.mockResolvedValue(mockWallet);

      await service.incrementWithdrawalCounter('BTC', 2);

      expect(mockWallet.currentHourWithdrawals).toBe(2);
      expect(mockWallet.currentDayWithdrawals).toBe(2);
    });
  });

  describe('lockWallet', () => {
    it('should lock a wallet', async () => {
      const mockWallet = {
        assetCode: 'BTC',
        isLocked: false,
        save: jest.fn().mockResolvedValue(true),
      };

      mockCustodyWalletModel.findOne.mockResolvedValue(mockWallet);

      await service.lockWallet('BTC', 'Security breach');

      expect(mockWallet.isLocked).toBe(true);
      expect(mockWallet.save).toHaveBeenCalled();
    });
  });

  describe('unlockWallet', () => {
    it('should unlock a wallet', async () => {
      const mockWallet = {
        assetCode: 'BTC',
        isLocked: true,
        save: jest.fn().mockResolvedValue(true),
      };

      mockCustodyWalletModel.findOne.mockResolvedValue(mockWallet);

      await service.unlockWallet('BTC');

      expect(mockWallet.isLocked).toBe(false);
      expect(mockWallet.save).toHaveBeenCalled();
    });
  });
});
