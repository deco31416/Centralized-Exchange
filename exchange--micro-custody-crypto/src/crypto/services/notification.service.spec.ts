import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('notifyDepositCredited', () => {
    it('should notify user of deposit credited', async () => {
      await expect(
        service.notifyDepositCredited({
          userId: 'user123',
          amount: 1.5,
          assetCode: 'BNB',
          txHash: '0xabc',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('notifyWithdrawalBroadcasted', () => {
    it('should notify user of withdrawal broadcasted', async () => {
      await expect(
        service.notifyWithdrawalBroadcasted({
          userId: 'user123',
          amount: 1.0,
          assetCode: 'BNB',
          txHash: '0xdef',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('notifyWithdrawalCompleted', () => {
    it('should notify user of withdrawal completed', async () => {
      await expect(
        service.notifyWithdrawalCompleted({
          userId: 'user123',
          amount: 1.0,
          assetCode: 'BNB',
          txHash: '0xghi',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('notifyWithdrawalFailed', () => {
    it('should notify user of withdrawal failed', async () => {
      await expect(
        service.notifyWithdrawalFailed({
          userId: 'user123',
          withdrawalId: 'withdrawal123',
          reason: 'Insufficient balance',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('alertAdmins', () => {
    it('should alert admins of critical issues', async () => {
      await expect(
        service.alertAdmins({
          severity: 'critical',
          message: 'System error detected',
          error: 'Error details',
        }),
      ).resolves.not.toThrow();
    });

    it('should handle different severity levels', async () => {
      await expect(
        service.alertAdmins({
          severity: 'info',
          message: 'Info message',
        }),
      ).resolves.not.toThrow();

      await expect(
        service.alertAdmins({
          severity: 'warning',
          message: 'Warning message',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('alertSigners', () => {
    it('should alert signers of multi-sig request', async () => {
      await expect(
        service.alertSigners({
          multiSigRequestId: 'request123',
          withdrawalId: 'withdrawal123',
        }),
      ).resolves.not.toThrow();
    });
  });
});
