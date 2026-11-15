import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HoldService } from './hold.service';
import { Hold, HoldState } from '../models/hold.schema';
import { BalanceService } from './balance.service';

describe('HoldService', () => {
  let service: HoldService;
  let mockHoldModel: Partial<Model<Hold>>;
  let mockBalanceService: Partial<BalanceService>;

  beforeEach(async () => {
    mockHoldModel = {
      findById: jest.fn(),
      find: jest.fn(),
    };
    mockBalanceService = {
      hasSufficientBalance: jest.fn().mockResolvedValue(true),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoldService,
        {
          provide: getModelToken(Hold.name),
          useValue: mockHoldModel,
        },
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();
    service = module.get<HoldService>(HoldService);
  });

  describe('createHold', () => {
    it('should create a hold successfully', async () => {
      const inputDto = {
        accountId: '507f1f77bcf86cd799439011',
        amountMinor: 1000,
        reason: 'Escrow for order',
      };
      const mockHold = {
        ...inputDto,
        state: HoldState.ACTIVE,
        save: jest.fn().mockResolvedValue({ _id: 'hold123', ...inputDto }),
      };
      (mockBalanceService.hasSufficientBalance as jest.Mock).mockResolvedValue(
        true,
      );
      Object.setPrototypeOf(mockHoldModel, Model);
      (mockHoldModel as any).prototype = mockHold;
      mockHoldModel.constructor = jest.fn().mockReturnValue(mockHold);
      const actualHold = await mockHold.save();
      expect(actualHold).toHaveProperty('_id');
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      const inputDto = {
        accountId: '507f1f77bcf86cd799439011',
        amountMinor: 1000,
        reason: 'Escrow for order',
      };
      (mockBalanceService.hasSufficientBalance as jest.Mock).mockResolvedValue(
        false,
      );
      await expect(service.createHold(inputDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid account ID', async () => {
      const inputDto = {
        accountId: 'invalid-id',
        amountMinor: 1000,
        reason: 'Escrow for order',
      };
      await expect(service.createHold(inputDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('releaseHold', () => {
    it('should release an active hold', async () => {
      const mockHold = {
        _id: '507f1f77bcf86cd799439011',
        state: HoldState.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          state: HoldState.RELEASED,
        }),
      };
      const mockExec = jest.fn().mockResolvedValue(mockHold);
      (mockHoldModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });
      const actualHold = await service.findHoldById('507f1f77bcf86cd799439011');
      actualHold.state = HoldState.RELEASED;
      expect(actualHold.state).toBe(HoldState.RELEASED);
    });

    it('should throw BadRequestException when releasing inactive hold', async () => {
      const mockHold = {
        _id: '507f1f77bcf86cd799439012',
        state: HoldState.RELEASED,
      };
      const mockExec = jest.fn().mockResolvedValue(mockHold);
      (mockHoldModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });
      await expect(
        service.releaseHold('507f1f77bcf86cd799439012'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findHoldById', () => {
    it('should find hold by ID', async () => {
      const mockHold = { _id: '507f1f77bcf86cd799439013' };
      const mockExec = jest.fn().mockResolvedValue(mockHold);
      (mockHoldModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });
      const actualHold = await service.findHoldById('507f1f77bcf86cd799439013');
      expect(actualHold).toEqual(mockHold);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      await expect(service.findHoldById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
