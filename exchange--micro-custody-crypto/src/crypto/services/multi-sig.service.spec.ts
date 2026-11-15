import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MultiSigService } from './multi-sig.service';
import { MultiSigRequest } from '../models/multi-sig-request.schema';

describe('MultiSigService', () => {
  let service: MultiSigService;

  const mockMultiSigModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    signatures: [],
    save: jest.fn().mockResolvedValue(dto),
  }));
  mockMultiSigModel.findOne = jest.fn();
  mockMultiSigModel.findById = jest.fn();
  mockMultiSigModel.find = jest.fn();
  mockMultiSigModel.updateMany = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiSigService,
        {
          provide: getModelToken(MultiSigRequest.name),
          useValue: mockMultiSigModel,
        },
      ],
    }).compile();

    service = module.get<MultiSigService>(MultiSigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateMultiSig', () => {
    it('should create a new multi-sig request', async () => {
      mockMultiSigModel.findOne.mockResolvedValue(null);

      const result = await service.initiateMultiSig({
        withdrawalId: 'withdrawal123',
        unsignedTx: { to: '0xabc', value: '1000' },
        requiredSignatures: 2,
      });

      expect(result).toBeDefined();
      expect(result.withdrawalId).toBe('withdrawal123');
      expect(result.requiredSignatures).toBe(2);
    });

    it('should return existing multi-sig request if already exists', async () => {
      const existingRequest = {
        withdrawalId: 'withdrawal123',
        requiredSignatures: 2,
        status: 'pending',
      };
      mockMultiSigModel.findOne.mockResolvedValue(existingRequest);

      const result = await service.initiateMultiSig({
        withdrawalId: 'withdrawal123',
        unsignedTx: { to: '0xabc', value: '1000' },
      });

      expect(result).toEqual(existingRequest);
    });
  });

  describe('addSignature', () => {
    it('should add a signature to multi-sig request', async () => {
      const mockRequest = {
        _id: 'request123',
        withdrawalId: 'withdrawal123',
        requiredSignatures: 2,
        signatures: [],
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true),
      };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      const result = await service.addSignature({
        multiSigRequestId: 'request123',
        signerId: 'admin-ceo',
        signature: '0xsignature',
      });

      expect(result.signatures.length).toBe(1);
      expect(result.signatures[0].signerId).toBe('admin-ceo');
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should approve request when required signatures reached', async () => {
      const mockRequest = {
        _id: 'request123',
        withdrawalId: 'withdrawal123',
        requiredSignatures: 2,
        signatures: [{ signerId: 'admin-ceo', signature: '0xsig1', signedAt: new Date() }],
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true),
      };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      const result = await service.addSignature({
        multiSigRequestId: 'request123',
        signerId: 'admin-cfo',
        signature: '0xsig2',
      });

      expect(result.status).toBe('approved');
      expect(result.signatures.length).toBe(2);
    });

    it('should throw NotFoundException if request not found', async () => {
      mockMultiSigModel.findById.mockResolvedValue(null);

      await expect(
        service.addSignature({
          multiSigRequestId: 'request123',
          signerId: 'admin-ceo',
          signature: '0xsig',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if request is expired', async () => {
      const mockRequest = {
        status: 'pending',
        expiresAt: new Date(Date.now() - 1000),
        save: jest.fn().mockResolvedValue(true),
      };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      await expect(
        service.addSignature({
          multiSigRequestId: 'request123',
          signerId: 'admin-ceo',
          signature: '0xsig',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if signer is not authorized', async () => {
      const mockRequest = {
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signatures: [],
      };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      await expect(
        service.addSignature({
          multiSigRequestId: 'request123',
          signerId: 'unauthorized-user',
          signature: '0xsig',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error if signer already signed', async () => {
      const mockRequest = {
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signatures: [{ signerId: 'admin-ceo', signature: '0xsig1' }],
      };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      await expect(
        service.addSignature({
          multiSigRequestId: 'request123',
          signerId: 'admin-ceo',
          signature: '0xsig2',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectMultiSig', () => {
    it('should reject a multi-sig request', async () => {
      const mockRequest = {
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      const result = await service.rejectMultiSig('request123', 'admin-ceo', 'Invalid transaction');

      expect(result.status).toBe('rejected');
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should throw error if signer is not authorized', async () => {
      const mockRequest = { status: 'pending' };
      mockMultiSigModel.findById.mockResolvedValue(mockRequest);

      await expect(
        service.rejectMultiSig('request123', 'unauthorized-user', 'reason'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPendingMultiSigRequests', () => {
    it('should return all pending requests', async () => {
      const mockRequests = [
        { status: 'pending', expiresAt: new Date(Date.now() + 1000) },
      ];
      mockMultiSigModel.find.mockResolvedValue(mockRequests);

      const result = await service.getPendingMultiSigRequests();

      expect(result).toEqual(mockRequests);
    });
  });

  describe('isAuthorizedSigner', () => {
    it('should return true for authorized signer', () => {
      expect(service.isAuthorizedSigner('admin-ceo')).toBe(true);
      expect(service.isAuthorizedSigner('admin-cfo')).toBe(true);
    });

    it('should return false for unauthorized signer', () => {
      expect(service.isAuthorizedSigner('random-user')).toBe(false);
    });
  });

  describe('getAuthorizedSigners', () => {
    it('should return list of authorized signers', () => {
      const signers = service.getAuthorizedSigners();
      
      expect(Array.isArray(signers)).toBe(true);
      expect(signers.length).toBeGreaterThan(0);
      expect(signers).toContain('admin-ceo');
    });
  });
});
