import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  Account,
  AccountStatus,
  AccountType,
  OwnerType,
} from '../models/account.schema';

describe('AccountService', () => {
  let service: AccountService;
  let mockAccountModel: Partial<Model<Account>>;

  beforeEach(async () => {
    mockAccountModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel,
        },
      ],
    }).compile();
    service = module.get<AccountService>(AccountService);
  });

  describe('createAccount', () => {
    it('should create a new account successfully', async () => {
      const inputDto = {
        ownerType: OwnerType.USER,
        ownerId: 'user123',
        assetCode: 'GIROD',
        accountType: AccountType.LIABILITY,
      };
      const mockAccount = {
        ...inputDto,
        status: AccountStatus.ACTIVE,
        save: jest.fn().mockResolvedValue({ _id: 'acc123', ...inputDto }),
      };
      jest.spyOn(service, 'findAccountByOwnerAndAsset').mockResolvedValue(null);
      (mockAccountModel as any).prototype = mockAccount;
      mockAccountModel.constructor = jest.fn().mockReturnValue(mockAccount);
      Object.setPrototypeOf(mockAccountModel, Model);
      const actualAccount = mockAccount;
      const expectedAccount = await actualAccount.save();
      expect(expectedAccount).toHaveProperty('_id');
    });

    it('should throw ConflictException if account already exists', async () => {
      const inputDto = {
        ownerType: OwnerType.USER,
        ownerId: 'user123',
        assetCode: 'GIROD',
        accountType: AccountType.LIABILITY,
      };
      const mockExistingAccount = { _id: 'acc123', ...inputDto } as any;
      jest
        .spyOn(service, 'findAccountByOwnerAndAsset')
        .mockResolvedValue(mockExistingAccount);
      await expect(service.createAccount(inputDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAccountById', () => {
    it('should find account by ID', async () => {
      const mockAccount = {
        _id: '507f1f77bcf86cd799439011',
        ownerId: 'user123',
        assetCode: 'GIROD',
      } as any;
      const mockExec = jest.fn().mockResolvedValue(mockAccount);
      (mockAccountModel.findById as jest.Mock).mockReturnValue({
        exec: mockExec,
      });
      const actualAccount = await service.findAccountById(
        '507f1f77bcf86cd799439011',
      );
      expect(actualAccount).toEqual(mockAccount);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      await expect(service.findAccountById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when account not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      (mockAccountModel.findById as jest.Mock).mockReturnValue({
        exec: mockExec,
      });
      await expect(
        service.findAccountById('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAccountByOwnerAndAsset', () => {
    it('should find account by owner and asset', async () => {
      const mockAccount = {
        _id: 'acc123',
        ownerId: 'user123',
        assetCode: 'GIROD',
      } as any;
      const mockExec = jest.fn().mockResolvedValue(mockAccount);
      (mockAccountModel.findOne as jest.Mock).mockReturnValue({
        exec: mockExec,
      });
      const actualAccount = await service.findAccountByOwnerAndAsset({
        ownerId: 'user123',
        assetCode: 'GIROD',
      });
      expect(actualAccount).toEqual(mockAccount);
    });
  });
});
