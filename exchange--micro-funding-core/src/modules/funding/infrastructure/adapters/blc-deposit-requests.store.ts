import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

export type BlcDepositRequestStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_MORE_INFO';

export interface BlcDepositMethod {
  methodId: string;
  methodCode: string;
  country: string;
  fiatCode: string;
  name: string;
  type: string;
  instructions: string;
  accountLabel: string;
  accountReferenceMasked: string;
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  iconUrl: string;
  displayOrder: number;
  isInternal: boolean;
  isManualDeposit: boolean;
  adminEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlcDepositRequest {
  requestId: string;
  userId: string;
  amount: number;
  currency: 'BLC';
  selectedPaymentMethodId: string;
  reference: string;
  status: BlcDepositRequestStatus;
  userNote?: string;
  adminNote?: string;
  approvedBy?: string;
  rejectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlcDevTopupResult {
  movementId: string;
  userId: string;
  amount: number;
  currency: 'BLC';
  reason: string;
  status: 'CREDITED';
  createdAt: string;
  walletLedgerTxId?: string;
}

@Injectable()
export class BlcDepositRequestsStore {
  private readonly logger = new Logger(BlcDepositRequestsStore.name);
  private readonly storagePath: string;

  private methods: BlcDepositMethod[] = [
    {
      methodId: 'blc-mx-spei-001',
      methodCode: 'spei',
      country: 'MX',
      fiatCode: 'MXN',
      name: 'SPEI corporativo BlackCEX',
      type: 'BANK_TRANSFER',
      instructions:
        'Realiza transferencia SPEI y usa la referencia única del formulario para conciliación.',
      accountLabel: 'Cuenta concentradora MXN',
      accountReferenceMasked: 'CLABE ************9016',
      enabled: true,
      minAmount: 50,
      maxAmount: 250000,
      iconUrl: '/images/logos/FiatMethods/spei-logo.svg',
      displayOrder: 1,
      isInternal: true,
      isManualDeposit: true,
      adminEditable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      methodId: 'blc-ve-pagomovil-001',
      methodCode: 'pago_movil',
      country: 'VE',
      fiatCode: 'VES',
      name: 'Pago Móvil BlackCEX',
      type: 'MOBILE_PAYMENT',
      instructions:
        'Envía por Pago Móvil y adjunta referencia para validación manual por operaciones.',
      accountLabel: 'Alias pago móvil empresarial',
      accountReferenceMasked: '0412******90',
      enabled: true,
      minAmount: 100,
      maxAmount: 5000000,
      iconUrl: '/images/logos/FiatMethods/mobile-wallet-logo.svg',
      displayOrder: 1,
      isInternal: true,
      isManualDeposit: true,
      adminEditable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      methodId: 'blc-us-ach-001',
      methodCode: 'ach',
      country: 'US',
      fiatCode: 'USD',
      name: 'ACH BlackCEX',
      type: 'ACH',
      instructions:
        'Transferencia ACH a cuenta empresarial. Incluye referencia única para conciliación.',
      accountLabel: 'US settlement account',
      accountReferenceMasked: 'ACH ********3210',
      enabled: true,
      minAmount: 5,
      maxAmount: 500000,
      iconUrl: '/images/logos/FiatMethods/ach-logo.svg',
      displayOrder: 1,
      isInternal: true,
      isManualDeposit: true,
      adminEditable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private requests: BlcDepositRequest[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.storagePath =
      process.env.BLC_STORE_FILE_PATH ||
      path.resolve(process.cwd(), 'data', 'blc-deposit-store.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.storagePath)) return;
      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const parsed = JSON.parse(raw) as {
        methods?: BlcDepositMethod[];
        requests?: BlcDepositRequest[];
      };

      if (Array.isArray(parsed.methods) && parsed.methods.length > 0) {
        this.methods = parsed.methods;
      }
      if (Array.isArray(parsed.requests)) {
        this.requests = parsed.requests;
      }
    } catch (error) {
      this.logger.warn(`No se pudo cargar store BLC desde disco: ${(error as Error).message}`);
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.storagePath,
        JSON.stringify(
          {
            methods: this.methods,
            requests: this.requests,
          },
          null,
          2,
        ),
        'utf-8',
      );
    } catch (error) {
      this.logger.warn(`No se pudo persistir store BLC: ${(error as Error).message}`);
    }
  }

  getDepositMethods(filters?: { country?: string; fiatCode?: string }): BlcDepositMethod[] {
    const country = filters?.country?.trim().toUpperCase();
    const fiatCode = filters?.fiatCode?.trim().toUpperCase();

    return this.methods
      .filter((m) => {
        if (!m.enabled) return false;
        if (country && m.country !== country) return false;
        if (fiatCode && m.fiatCode !== fiatCode) return false;
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getAllMethods(): BlcDepositMethod[] {
    return [...this.methods].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getMethodById(methodId: string): BlcDepositMethod | null {
    return this.methods.find((m) => m.methodId === methodId) ?? null;
  }

  createMethod(input: Omit<BlcDepositMethod, 'methodId' | 'createdAt' | 'updatedAt'>): BlcDepositMethod {
    const now = new Date().toISOString();
    const method: BlcDepositMethod = {
      ...input,
      methodId: `blc_method_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.methods.push(method);
    this.saveToDisk();
    return method;
  }

  createDepositRequest(input: {
    userId: string;
    amount: number;
    selectedPaymentMethodId: string;
    userNote?: string;
    reference?: string;
  }): BlcDepositRequest {
    const now = new Date().toISOString();
    const requestId = `blc_req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const generatedReference =
      input.reference && input.reference.trim().length > 0
        ? input.reference.trim()
        : `BLC-${Date.now().toString(36).toUpperCase()}`;

    const request: BlcDepositRequest = {
      requestId,
      userId: input.userId,
      amount: input.amount,
      currency: 'BLC',
      selectedPaymentMethodId: input.selectedPaymentMethodId,
      reference: generatedReference,
      status: 'PENDING_REVIEW',
      userNote: input.userNote,
      createdAt: now,
      updatedAt: now,
    };

    this.requests.unshift(request);
    this.saveToDisk();
    void this.notifyAdminNewRequest(request);
    return request;
  }

  async createDevTopup(input: {
    userId: string;
    amount: number;
    reason?: string;
  }): Promise<BlcDevTopupResult> {
    const now = new Date().toISOString();
    const reason = input.reason?.trim() || 'development topup';
    const creditResult = await this.creditBlcAmountToWallet({
      userId: input.userId,
      amount: input.amount,
      reason,
      adminId: 'dev-topup',
    });

    if (!creditResult.credited) {
      throw new BadGatewayException(
        creditResult.errorMessage || 'No fue posible acreditar BLC en wallet-ledger',
      );
    }

    return {
      movementId: `blc_dev_${Date.now()}`,
      userId: input.userId,
      amount: input.amount,
      currency: 'BLC',
      reason,
      status: 'CREDITED',
      createdAt: now,
      walletLedgerTxId: creditResult.walletLedgerTxId,
    };
  }

  listUserRequests(userId: string): BlcDepositRequest[] {
    return this.requests.filter((r) => r.userId === userId);
  }

  listAllRequests(status?: BlcDepositRequestStatus): BlcDepositRequest[] {
    return status ? this.requests.filter((r) => r.status === status) : [...this.requests];
  }

  async approveRequest(requestId: string, approvedBy: string, adminNote?: string): Promise<BlcDepositRequest | null> {
    const request = this.requests.find((r) => r.requestId === requestId);
    if (!request) return null;

    const creditResult = await this.creditBlcAmountToWallet({
      userId: request.userId,
      amount: request.amount,
      reason: `BLC deposit request approved: ${request.requestId}`,
      adminId: approvedBy,
    });
    request.status = creditResult.credited ? 'APPROVED' : 'NEEDS_MORE_INFO';
    request.approvedBy = approvedBy;
    request.adminNote = creditResult.credited
      ? adminNote
      : `${adminNote ? `${adminNote} | ` : ''}Aprobado sin acreditar: wallet-ledger no confirmo credito BLC.`;
    request.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return request;
  }

  rejectRequest(requestId: string, rejectedBy: string, adminNote?: string): BlcDepositRequest | null {
    const request = this.requests.find((r) => r.requestId === requestId);
    if (!request) return null;
    request.status = 'REJECTED';
    request.rejectedBy = rejectedBy;
    request.adminNote = adminNote;
    request.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return request;
  }

  needsMoreInfoRequest(requestId: string, reviewedBy: string, adminNote?: string): BlcDepositRequest | null {
    const request = this.requests.find((r) => r.requestId === requestId);
    if (!request) return null;
    request.status = 'NEEDS_MORE_INFO';
    request.approvedBy = reviewedBy;
    request.adminNote = adminNote ?? 'Se requiere informacion adicional para continuar la conciliacion.';
    request.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return request;
  }

  updateMethod(methodId: string, changes: Partial<BlcDepositMethod>): BlcDepositMethod | null {
    const method = this.methods.find((m) => m.methodId === methodId);
    if (!method) return null;
    Object.assign(method, changes, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return method;
  }

  enableMethod(methodId: string): BlcDepositMethod | null {
    return this.updateMethod(methodId, { enabled: true });
  }

  disableMethod(methodId: string): BlcDepositMethod | null {
    return this.updateMethod(methodId, { enabled: false });
  }

  deleteMethod(methodId: string): boolean {
    const index = this.methods.findIndex((m) => m.methodId === methodId);
    if (index < 0) return false;
    this.methods.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  private async creditBlcAmountToWallet(input: {
    userId: string;
    amount: number;
    reason: string;
    adminId: string;
  }): Promise<{ credited: boolean; walletLedgerTxId?: string; errorMessage?: string }> {
    const walletLedgerServiceUrl =
      this.configService.get<string>('services.walletLedgerServiceUrl') ||
      process.env.WALLET_LEDGER_SERVICE_URL;
    const internalToken =
      this.configService.get<string>('security.internalAuthToken') ||
      process.env.INTERNAL_AUTH_TOKEN ||
      '';

    if (!walletLedgerServiceUrl || !internalToken) {
      this.logger.warn('No se pudo acreditar BLC: falta WALLET_LEDGER_SERVICE_URL o INTERNAL_AUTH_TOKEN.');
      return {
        credited: false,
        errorMessage: 'Falta configuracion interna para acreditar BLC.',
      };
    }

    const amountMinorUnits = String(Math.round(input.amount * 100));
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${walletLedgerServiceUrl}/internal/wallets/admin/add-balance`,
          {
            userId: input.userId,
            currency: 'BLC',
            amountMinorUnits,
            reason: input.reason,
            adminId: input.adminId,
          },
          {
            headers: {
              'x-internal-auth': internalToken,
              Authorization: `Bearer ${internalToken}`,
            },
            timeout: 5000,
          },
        ),
      );

      const payload = response.data as { txId?: string } | undefined;
      return {
        credited: true,
        walletLedgerTxId: payload?.txId,
      };
    } catch (error) {
      this.logger.warn(`Fallo acreditacion BLC en wallet-ledger: ${(error as Error).message}`);
      return {
        credited: false,
        errorMessage: (error as Error).message,
      };
    }
  }

  private async notifyAdminNewRequest(request: BlcDepositRequest): Promise<void> {
    const notificationsUrl =
      this.configService.get<string>('services.notificationsServiceUrl') ||
      process.env.NOTIFICATIONS_SERVICE_URL;
    const internalToken =
      this.configService.get<string>('security.internalAuthToken') ||
      process.env.INTERNAL_AUTH_TOKEN ||
      '';

    if (!notificationsUrl || !internalToken) {
      this.logger.warn('No se envio notificacion admin BLC: falta NOTIFICATIONS_SERVICE_URL o token interno.');
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          `${notificationsUrl}/api/v1/notifications`,
          {
            type: 'BLC_DEPOSIT_REQUEST',
            channel: 'admin',
            payload: {
              requestId: request.requestId,
              userId: request.userId,
              amount: request.amount,
              currency: request.currency,
              status: request.status,
            },
          },
          {
            headers: {
              'x-internal-auth': internalToken,
              Authorization: `Bearer ${internalToken}`,
            },
            timeout: 4000,
          },
        ),
      );
    } catch (error) {
      this.logger.warn(`Fallo notificacion admin BLC: ${(error as Error).message}`);
    }
  }
}
