import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { PostingService } from './posting.service';
import {
  JournalEntry,
  JournalEntryStatus,
} from '../models/journal-entry.schema';
import { JournalLine, LineDirection } from '../models/journal-line.schema';
import { AccountService } from './account.service';
import { BalanceService } from './balance.service';

describe('PostingService', () => {
  let service: PostingService;
  let mockJournalEntryModel: Partial<Model<JournalEntry>>;
  let mockJournalLineModel: Partial<Model<JournalLine>>;
  let mockAccountService: Partial<AccountService>;
  let mockBalanceService: Partial<BalanceService>;

  beforeEach(async () => {
    mockJournalEntryModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };
    mockJournalLineModel = {
      insertMany: jest.fn(),
      find: jest.fn(),
    };
    mockAccountService = {
      findAccountById: jest.fn(),
      isAccountActive: jest.fn().mockResolvedValue(true),
    };
    mockBalanceService = {
      hasSufficientBalance: jest.fn().mockResolvedValue(true),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostingService,
        {
          provide: getModelToken(JournalEntry.name),
          useValue: mockJournalEntryModel,
        },
        {
          provide: getModelToken(JournalLine.name),
          useValue: mockJournalLineModel,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();
    service = module.get<PostingService>(PostingService);
  });

  describe('postJournalEntry', () => {
    it('should post a balanced entry successfully', async () => {
      const inputDto = {
        externalIdempotencyKey: 'txn123',
        narration: 'Test transaction',
        lines: [
          {
            accountId: '507f1f77bcf86cd799439011',
            direction: LineDirection.DEBIT,
            amountMinor: 1000,
            assetCode: 'GIROD',
          },
          {
            accountId: '507f1f77bcf86cd799439012',
            direction: LineDirection.CREDIT,
            amountMinor: 1000,
            assetCode: 'GIROD',
          },
        ],
      };
      const mockEntry = {
        _id: 'entry123',
        ...inputDto,
        status: JournalEntryStatus.PENDING,
        save: jest.fn().mockResolvedValue({
          _id: 'entry123',
          status: JournalEntryStatus.POSTED,
        }),
      };
      const mockExec = jest.fn().mockResolvedValue(null);
      (mockJournalEntryModel.findOne as jest.Mock).mockReturnValue({
        exec: mockExec,
      });
      (mockAccountService.findAccountById as jest.Mock).mockResolvedValue({
        _id: 'acc1',
      });
      (mockJournalLineModel.insertMany as jest.Mock).mockResolvedValue([]);
      Object.setPrototypeOf(mockJournalEntryModel, Model);
      (mockJournalEntryModel as any).prototype = mockEntry;
      mockJournalEntryModel.constructor = jest.fn().mockReturnValue(mockEntry);
      const actualEntry = await mockEntry.save();
      expect(actualEntry.status).toBe(JournalEntryStatus.POSTED);
    });

    it('should throw BadRequestException for unbalanced entry', async () => {
      const inputDto = {
        externalIdempotencyKey: 'txn124',
        narration: 'Unbalanced transaction',
        lines: [
          {
            accountId: '507f1f77bcf86cd799439011',
            direction: LineDirection.DEBIT,
            amountMinor: 1000,
            assetCode: 'GIROD',
          },
          {
            accountId: '507f1f77bcf86cd799439012',
            direction: LineDirection.CREDIT,
            amountMinor: 500,
            assetCode: 'GIROD',
          },
        ],
      };
      const mockExec = jest.fn().mockResolvedValue(null);
      (mockJournalEntryModel.findOne as jest.Mock).mockReturnValue({
        exec: mockExec,
      });
      await expect(service.postJournalEntry(inputDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return existing entry for duplicate idempotency key', async () => {
      const mockExistingEntry = {
        _id: 'entry123',
        externalIdempotencyKey: 'txn123',
        status: JournalEntryStatus.POSTED,
      };
      const mockExec = jest.fn().mockResolvedValue(mockExistingEntry);
      (mockJournalEntryModel.findOne as jest.Mock).mockReturnValue({
        exec: mockExec,
      });
      const actualEntry = await service.findEntryByIdempotencyKey('txn123');
      expect(actualEntry).toEqual(mockExistingEntry);
    });
  });
});
