import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MultiSigRequest, MultiSigStatus } from '../models/multi-sig-request.schema';
import { MultiSigSignature } from '../models/withdrawal.schema';

/**
 * Service for managing multi-signature approvals for withdrawals
 */
@Injectable()
export class MultiSigService {
  private readonly logger = new Logger(MultiSigService.name);

  // Authorized signers (in production, this would come from database/config)
  private readonly authorizedSigners = [
    'admin-ceo',
    'admin-cfo',
    'admin-cto',
    'admin-security',
    'admin-operations',
  ];

  constructor(
    @InjectModel(MultiSigRequest.name)
    private readonly multiSigModel: Model<MultiSigRequest>,
  ) {}

  /**
   * Initiate a multi-sig request for a withdrawal
   */
  async initiateMultiSig(params: {
    withdrawalId: string;
    unsignedTx: any;
    requiredSignatures?: number;
  }): Promise<MultiSigRequest> {
    const { withdrawalId, unsignedTx, requiredSignatures = 2 } = params;

    // Check if request already exists
    const existing = await this.multiSigModel.findOne({ withdrawalId });
    if (existing) {
      this.logger.warn(
        `Multi-sig request already exists for withdrawal ${withdrawalId}`,
      );
      return existing;
    }

    // Create multi-sig request
    const multiSigRequest = new this.multiSigModel({
      withdrawalId,
      unsignedTx,
      requiredSignatures,
      signatures: [],
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await multiSigRequest.save();

    this.logger.log(
      `🔐 Multi-sig request created for withdrawal ${withdrawalId} (${requiredSignatures} signatures required)`,
    );

    return multiSigRequest;
  }

  /**
   * Add a signature to a multi-sig request
   */
  async addSignature(params: {
    multiSigRequestId: string;
    signerId: string;
    signature: string;
  }): Promise<MultiSigRequest> {
    const { multiSigRequestId, signerId, signature } = params;

    const request = await this.multiSigModel.findById(multiSigRequestId);
    if (!request) {
      throw new NotFoundException('Multi-sig request not found');
    }

    // Check if expired
    if (request.expiresAt && request.expiresAt < new Date()) {
      request.status = 'expired';
      await request.save();
      throw new BadRequestException('Multi-sig request has expired');
    }

    // Check if already approved or rejected
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Multi-sig request is already ${request.status}`,
      );
    }

    // Verify signer is authorized
    if (!this.isAuthorizedSigner(signerId)) {
      throw new ForbiddenException('Not authorized to sign');
    }

    // Check if signer already signed
    if (request.signatures.some((s) => s.signerId === signerId)) {
      throw new BadRequestException('Already signed by this signer');
    }

    // Add signature
    request.signatures.push({
      signerId,
      signature,
      signedAt: new Date(),
    });

    // Check if required signatures reached
    if (request.signatures.length >= request.requiredSignatures) {
      request.status = 'approved';
      request.approvedAt = new Date();

      this.logger.log(
        `✅ Multi-sig request ${multiSigRequestId} approved (${request.signatures.length}/${request.requiredSignatures} signatures)`,
      );
    } else {
      this.logger.log(
        `🔐 Signature added to multi-sig request ${multiSigRequestId} (${request.signatures.length}/${request.requiredSignatures})`,
      );
    }

    await request.save();

    return request;
  }

  /**
   * Reject a multi-sig request
   */
  async rejectMultiSig(
    multiSigRequestId: string,
    signerId: string,
    reason: string,
  ): Promise<MultiSigRequest> {
    const request = await this.multiSigModel.findById(multiSigRequestId);
    if (!request) {
      throw new NotFoundException('Multi-sig request not found');
    }

    // Verify signer is authorized
    if (!this.isAuthorizedSigner(signerId)) {
      throw new ForbiddenException('Not authorized to reject');
    }

    request.status = 'rejected';
    request.rejectedAt = new Date();

    await request.save();

    this.logger.warn(
      `❌ Multi-sig request ${multiSigRequestId} rejected by ${signerId}: ${reason}`,
    );

    return request;
  }

  /**
   * Get multi-sig request by ID
   */
  async getMultiSigRequest(
    multiSigRequestId: string,
  ): Promise<MultiSigRequest | null> {
    return this.multiSigModel.findById(multiSigRequestId);
  }

  /**
   * Get multi-sig request by withdrawal ID
   */
  async getMultiSigRequestByWithdrawal(
    withdrawalId: string,
  ): Promise<MultiSigRequest | null> {
    return this.multiSigModel.findOne({ withdrawalId });
  }

  /**
   * Get all pending multi-sig requests
   */
  async getPendingMultiSigRequests(): Promise<MultiSigRequest[]> {
    return this.multiSigModel.find({
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Check if a signer is authorized
   */
  isAuthorizedSigner(signerId: string): boolean {
    return this.authorizedSigners.includes(signerId);
  }

  /**
   * Get list of authorized signers
   */
  getAuthorizedSigners(): string[] {
    return [...this.authorizedSigners];
  }

  /**
   * Expire old pending requests (cron job)
   */
  async expireOldRequests(): Promise<void> {
    const result = await this.multiSigModel.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() },
      },
      {
        status: 'expired',
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(
        `⏰ Expired ${result.modifiedCount} old multi-sig requests`,
      );
    }
  }
}
