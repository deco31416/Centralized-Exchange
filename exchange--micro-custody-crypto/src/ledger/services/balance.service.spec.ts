import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BalanceService } from './balance.service';
import { JournalLine, LineDirection } from '../models/journal-line.schema';
import { Hold } from '../models/hold.schema';
import { JournalEntry } from '../models/journal-entry.schema';

describe('BalanceService', () => {
  let service: BalanceService;
  let mockJournalLineModel: Partial<Model<JournalLine>>;
  let mockJournalEntryModel: Partial<Model<JournalEntry>>;
  let mockHoldModel: Partial<Model<Hold>>;

  beforeEach(async () => {
    mockJournalLineModel = {
      find: jest.fn(),
    };
    mockJournalEntryModel = {
      find: jest.fn(),
    };
    mockHoldModel = {
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getModelToken(JournalLine.name),
          useValue: mockJournalLineModel,
        },
        {
          provide: getModelToken(JournalEntry.name),
          useValue: mockJournalEntryModel,
        },
        {
          provide: getModelToken(Hold.name),
          useValue: mockHoldModel,
        },
      ],
    }).compile();
    service = module.get<BalanceService>(BalanceService);
  });

  describe('calculateTotalBalance', () => {
    it('should calculate balance correctly', async () => {
      const mockEntries = [{ _id: 'entry1' }, { _id: 'entry2' }];
      const mockLines = [
        { direction: LineDirection.CREDIT, amountMinor: 1000 },
        { direction: LineDirection.DEBIT, amountMinor: 300 },
      ];
      const mockSelectExec = jest.fn().mockResolvedValue(mockEntries);
      const mockFindExec = jest.fn().mockResolvedValue(mockLines);
      (mockJournalEntryModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({ exec: mockSelectExec }),
      });
      (mockJournalLineModel.find as jest.Mock).mockReturnValue({
        exec: mockFindExec,
      });
      const actualBalance = await service.calculateTotalBalance(
        '507f1f77bcf86cd799439011',
      );
      const expectedBalance = 700;
      expect(actualBalance).toBe(expectedBalance);
    });

    it('should return 0 for invalid account ID', async () => {
      const actualBalance = await service.calculateTotalBalance('invalid-id');
      expect(actualBalance).toBe(0);
    });
  });

  describe('calculateHeldBalance', () => {
    it('should calculate held balance correctly', async () => {
      const mockHolds = [{ amountMinor: 100 }, { amountMinor: 200 }];
      const mockExec = jest.fn().mockResolvedValue(mockHolds);
      (mockHoldModel.find as jest.Mock).mockReturnValue({ exec: mockExec });
      const actualHeld = await service.calculateHeldBalance(
        '507f1f77bcf86cd799439011',
      );
      const expectedHeld = 300;
      expect(actualHeld).toBe(expectedHeld);
    });
  });

  describe('getAccountBalance', () => {
    it('should return complete balance information', async () => {
      jest.spyOn(service, 'calculateTotalBalance').mockResolvedValue(1000);
      jest.spyOn(service, 'calculateHeldBalance').mockResolvedValue(200);
      const actualBalance = await service.getAccountBalance({
        accountId: 'acc123',
        assetCode: 'GIROD',
      });
      expect(actualBalance.balanceMinor).toBe(1000);
      expect(actualBalance.heldMinor).toBe(200);
      expect(actualBalance.availableMinor).toBe(800);
    });
  });

  describe('hasSufficientBalance', () => {
    it('should return true when balance is sufficient', async () => {
      jest.spyOn(service, 'calculateTotalBalance').mockResolvedValue(1000);
      jest.spyOn(service, 'calculateHeldBalance').mockResolvedValue(200);
      const hasSufficient = await service.hasSufficientBalance({
        accountId: 'acc123',
        requiredAmount: 500,
      });
      expect(hasSufficient).toBe(true);
    });

    it('should return false when balance is insufficient', async () => {
      jest.spyOn(service, 'calculateTotalBalance').mockResolvedValue(1000);
      jest.spyOn(service, 'calculateHeldBalance').mockResolvedValue(200);
      const hasSufficient = await service.hasSufficientBalance({
        accountId: 'acc123',
        requiredAmount: 900,
      });
      expect(hasSufficient).toBe(false);
    });
  });
});
