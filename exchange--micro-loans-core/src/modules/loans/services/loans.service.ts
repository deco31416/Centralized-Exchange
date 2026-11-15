import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { ApiResponseInterface } from '../../../common/interfaces/api-response.interface';
import { AcceptContractDto } from '../dtos/accept-contract.dto';
import { CreateLoanApplicationDto } from '../dtos/create-loan-application.dto';
import { RegisterLoanPaymentDto } from '../dtos/register-loan-payment.dto';
import { SimulateLoanDto } from '../dtos/simulate-loan.dto';
import { LoanInterface } from '../interfaces/loan.interface';
import { LoanStatusEnum } from '../models/loan-status.enum';
import { Loan, LoanDocument } from '../schemas/loan.schema';
import { NotificationsClientService } from './notifications-client.service';

type AuthProfile = {
  userId: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  status?: string;
  createdAt?: string;
};

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name)
    private readonly loanModel: Model<LoanDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly notificationsClient: NotificationsClientService,
  ) {}

  health(): ApiResponseInterface {
    return {
      success: true,
      data: {
        service: 'Exchange--micro-loans-core',
        module: 'loans',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getProfile(userId?: string): Promise<ApiResponseInterface> {
    const user = await this.getCurrentUser(userId);
    const balances = await this.getUserWalletBalances(user.userId).catch(() => []);
    const loans = await this.loanModel.find({ userId: user.userId }).lean();

    const activeLoans = loans.filter((l) => l.status === LoanStatusEnum.ACTIVE);
    const totalBorrowed = loans.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0,
    );
    const totalOutstanding = loans.reduce(
      (acc, item) => acc + Number(item.balance || 0),
      0,
    );
    const paidLoansCount = loans.filter(
      (l) => l.status === LoanStatusEnum.CLOSED,
    ).length;

    const localCurrency =
      this.configService.get<string>('loans.currency') || 'MXN';

    const localWallet = balances.find((b: any) => b.currency === localCurrency);
    const availableWalletBalance = Number(localWallet?.availableFormatted || 0);

    const creditScore = this.buildCreditScore({
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      paidLoansCount,
      totalOutstanding,
      availableWalletBalance,
    });

    const riskLevel =
      creditScore >= 740
        ? 'excellent'
        : creditScore >= 680
          ? 'good'
          : creditScore >= 620
            ? 'medium'
            : 'high';

    const approvedLimitMxn = this.getApprovedLimitMxn(creditScore);
    const [approvedLimit, totalOutstandingConverted] = await Promise.all([
      this.convertMxnToCurrency(approvedLimitMxn, localCurrency),
      this.convertMxnToCurrency(totalOutstanding, localCurrency),
    ]);

    return {
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        },
        creditScore,
        riskLevel,
        borrowingCapacity: Math.max(
          Number((approvedLimit - totalOutstandingConverted).toFixed(8)),
          0,
        ),
        approvedLimit,
        currency: localCurrency,
        provider: this.configService.get<string>('loans.providerName'),
        metrics: {
          totalLoans: loans.length,
          activeLoans: activeLoans.length,
          paidLoansCount,
          totalBorrowed,
          totalOutstanding,
          availableWalletBalance,
        },
      },
    };
  }

  simulateLoan(payload: SimulateLoanDto): ApiResponseInterface {
    const currency =
      payload.currency ||
      this.configService.get<string>('loans.currency') ||
      'MXN';

    const summary = this.buildSimulation(
      payload.amount,
      payload.termMonths,
      payload.interestRate,
      currency,
    );

    return {
      success: true,
      message: 'Simulación generada correctamente.',
      data: summary,
    };
  }

  async createApplication(
    userId: string | undefined,
    payload: CreateLoanApplicationDto,
  ): Promise<ApiResponseInterface> {
    const user = await this.getCurrentUser(userId);

    const currency =
      payload.currency ||
      this.configService.get<string>('loans.currency') ||
      'MXN';

    // Validar que el monto solicitado no excede el límite aprobado para la moneda.
    const existingLoans = await this.loanModel.find({ userId: user.userId }).lean();
    const balances = await this.getUserWalletBalances(user.userId).catch(() => []);
    const localCurrencyForValidation = this.configService.get<string>('loans.currency') || 'MXN';
    const localWalletForValidation = balances.find((b: any) => b.currency === localCurrencyForValidation);
    const availableBalance = Number(localWalletForValidation?.availableFormatted || 0);
    const totalOutstandingForValidation = existingLoans.reduce((acc, item) => acc + Number(item.balance || 0), 0);
    const paidLoansCountForValidation = existingLoans.filter((l) => l.status === LoanStatusEnum.CLOSED).length;
    const activeLoansCount = existingLoans.filter((l) => l.status === LoanStatusEnum.ACTIVE).length;

    const creditScore = this.buildCreditScore({
      totalLoans: existingLoans.length,
      activeLoans: activeLoansCount,
      paidLoansCount: paidLoansCountForValidation,
      totalOutstanding: totalOutstandingForValidation,
      availableWalletBalance: availableBalance,
    });

    const approvedLimitMxn = this.getApprovedLimitMxn(creditScore);
    const approvedLimit = await this.convertMxnToCurrency(approvedLimitMxn, currency);

    if (payload.requestedAmount > approvedLimit) {
      throw new BadRequestException(
        `El monto solicitado (${payload.requestedAmount} ${currency}) excede el límite aprobado de ${approvedLimit.toFixed(8)} ${currency}.`,
      );
    }

    const simulation = this.buildSimulation(
      payload.requestedAmount,
      payload.termMonths,
      payload.requestedInterestRate,
      currency,
    );

    const loanId = `loan-${randomUUID()}`;

    const created = await this.loanModel.create({
      loanId,
      userId: user.userId,
      applicantFullName:
        payload.applicantFullName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      documentNumber: payload.documentNumber,
      email: payload.email || user.email,
      amount: payload.requestedAmount,
      balance: payload.requestedAmount,
      currency,
      status: LoanStatusEnum.PENDING,
      interestRate: payload.requestedInterestRate,
      termMonths: payload.termMonths,
      openingFee: simulation.openingFee,
      purpose: payload.purpose || null,
      schedule: simulation.schedule,
      payments: [],
    });

    await this.notificationsClient.sendLoanEmail({
      to: payload.email || user.email,
      userId: user.userId,
      subject: 'Solicitud de préstamo recibida',
      variables: {
        loanId: created.loanId,
        amount: created.amount,
        currency: created.currency,
        termMonths: created.termMonths,
        status: created.status,
      },
    }).catch(() => {});

    return {
      success: true,
      message: 'Solicitud de préstamo creada correctamente.',
      data: {
        applicationId: created.loanId,
        status: created.status,
        createdAt: this.normalizeDate(created.createdAt),
        contractPreview: {
          amount: created.amount,
          termMonths: created.termMonths,
          interestRate: created.interestRate,
          openingFee: created.openingFee,
          currency: created.currency,
        },
      },
    };
  }

  async acceptContract(
    userId: string | undefined,
    id: string,
    payload: AcceptContractDto,
  ): Promise<ApiResponseInterface> {
    const user = await this.getCurrentUser(userId);

    const loan = await this.loanModel.findOne({
      loanId: id,
      userId: user.userId,
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (!payload.accepted) {
      loan.status = LoanStatusEnum.CANCELLED;
      await loan.save();

      return {
        success: true,
        message: 'Contrato rechazado por el usuario.',
        data: {
          loanId: loan.loanId,
          status: loan.status,
        },
      };
    }

    await this.verifyUserPin(user.userId, payload.pin);

    loan.status = LoanStatusEnum.ACTIVE;
    loan.acceptedAt = new Date().toISOString();
    loan.acceptedBy =
      payload.acceptedBy ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.email ||
      user.userId;
    loan.disbursedAt = new Date().toISOString();

    await loan.save();

    await this.notificationsClient.sendLoanEmail({
      to: user.email,
      userId: user.userId,
      subject: 'Préstamo aprobado y desembolsado',
      variables: {
        loanId: loan.loanId,
        amount: loan.amount,
        currency: loan.currency,
        termMonths: loan.termMonths,
        status: loan.status,
        disbursedAt: loan.disbursedAt,
      },
    }).catch(() => {});

    return {
      success: true,
      message: 'Contrato aceptado correctamente.',
      data: {
        loanId: loan.loanId,
        accepted: true,
        acceptedAt: loan.acceptedAt,
        disbursedAt: loan.disbursedAt,
        status: loan.status,
      },
    };
  }

  async getLoans(
    userId?: string,
  ): Promise<ApiResponseInterface<LoanInterface[]>> {
    const user = await this.getCurrentUser(userId);

    const loans = await this.loanModel
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: loans.map((item) => ({
        id: item.loanId,
        applicantId: item.userId,
        amount: item.amount,
        balance: item.balance,
        currency: item.currency,
        status: item.status,
        interestRate: item.interestRate,
        termMonths: item.termMonths,
        createdAt: this.normalizeDate(item.createdAt),
      })),
    };
  }

  async getLoanById(
    userId: string | undefined,
    id: string,
  ): Promise<ApiResponseInterface<LoanInterface>> {
    const user = await this.getCurrentUser(userId);

    const loan = await this.loanModel
      .findOne({ loanId: id, userId: user.userId })
      .lean();

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return {
      success: true,
      data: {
        id: loan.loanId,
        applicantId: loan.userId,
        amount: loan.amount,
        balance: loan.balance,
        currency: loan.currency,
        status: loan.status,
        interestRate: loan.interestRate,
        termMonths: loan.termMonths,
        createdAt: this.normalizeDate(loan.createdAt),
      },
    };
  }

  async getLoanSchedule(
    userId: string | undefined,
    id: string,
  ): Promise<ApiResponseInterface> {
    const user = await this.getCurrentUser(userId);

    const loan = await this.loanModel
      .findOne({ loanId: id, userId: user.userId })
      .lean();

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return {
      success: true,
      data: {
        loanId: loan.loanId,
        currency: loan.currency,
        balance: loan.balance,
        installments: loan.schedule || [],
        payments: loan.payments || [],
      },
    };
  }

  async registerPayment(
    userId: string | undefined,
    id: string,
    payload: RegisterLoanPaymentDto,
  ): Promise<ApiResponseInterface> {
    const user = await this.getCurrentUser(userId);

    const loan = await this.loanModel.findOne({
      loanId: id,
      userId: user.userId,
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatusEnum.ACTIVE) {
      throw new BadRequestException('Only active loans can receive payments');
    }

    await this.verifyUserPin(user.userId, payload.pin);

    const paymentCurrency = payload.currency || loan.currency;

    if (paymentCurrency !== loan.currency) {
      throw new BadRequestException('Payment currency must match loan currency');
    }

    const balances = await this.getUserWalletBalances(user.userId);
    const wallet = balances.find((b: any) => b.currency === paymentCurrency);

    const availableBalance = Number(wallet?.availableFormatted || 0);

    if (availableBalance < payload.amount) {
      throw new BadRequestException(
        `Insufficient balance in wallet ${paymentCurrency}`,
      );
    }

    loan.payments.push({
      paymentId: `loan-payment-${randomUUID()}`,
      amount: payload.amount,
      currency: paymentCurrency,
      paymentMethod: payload.paymentMethod || 'wallet',
      externalReference: payload.externalReference || null,
      registeredAt: new Date().toISOString(),
      settlementStatus: 'pending_wallet_movement',
    } as any);

    this.applyPaymentToSchedule(loan, payload.amount);
    loan.balance = Number(Math.max(loan.balance - payload.amount, 0).toFixed(2));

    if (loan.balance <= 0) {
      loan.status = LoanStatusEnum.CLOSED;
    }

    await loan.save();

    const lastPayment = loan.payments[loan.payments.length - 1];

    await this.notificationsClient.sendLoanEmail({
      to: user.email,
      userId: user.userId,
      subject: loan.status === LoanStatusEnum.CLOSED
        ? 'Préstamo liquidado completamente'
        : 'Pago de préstamo registrado',
      variables: {
        loanId: loan.loanId,
        paymentAmount: payload.amount,
        currency: paymentCurrency,
        remainingBalance: loan.balance,
        status: loan.status,
      },
    }).catch(() => {});

    return {
      success: true,
      message:
        'Pago registrado correctamente. La validación de saldo y firma ya quedó conectada; el movimiento contable final del débito queda pendiente de amarre con el micro transaccional definitivo.',
      data: {
        loanId: loan.loanId,
        balance: loan.balance,
        status: loan.status,
        lastPayment,
      },
    };
  }

  private buildSimulation(
    amount: number,
    termMonths: number,
    interestRate: number,
    currency: string,
  ) {
    const monthlyRate = interestRate / 100;
    const baseInstallment =
      termMonths > 0
        ? Number(((amount * (1 + monthlyRate)) / termMonths).toFixed(2))
        : 0;

    const totalPayment = Number((baseInstallment * termMonths).toFixed(2));
    const totalInterest = Number((totalPayment - amount).toFixed(2));

    const openingFeeRate =
      this.configService.get<number>('loans.openingFeeRate') || 0.02;
    const openingFee = Number((amount * openingFeeRate).toFixed(2));

    const schedule = Array.from({ length: termMonths }, (_, index) => ({
      installmentNumber: index + 1,
      dueDate: this.addMonthsIso(new Date(), index + 1),
      amount: baseInstallment,
      principal: Number((amount / termMonths).toFixed(2)),
      interest: Number((totalInterest / termMonths).toFixed(2)),
      status: 'pending' as const,
      paidAmount: 0,
      paidAt: null,
    }));

    return {
      request: {
        amount,
        termMonths,
        interestRate,
        currency,
      },
      estimatedMonthlyPayment: baseInstallment,
      totalInterest,
      totalPayment,
      openingFee,
      schedule,
    };
  }

  private buildCreditScore(input: {
    totalLoans: number;
    activeLoans: number;
    paidLoansCount: number;
    totalOutstanding: number;
    availableWalletBalance: number;
  }): number {
    let score = 650;

    score += Math.min(input.paidLoansCount * 20, 80);
    score -= Math.min(input.activeLoans * 15, 60);
    score -=
      input.totalOutstanding > 10000
        ? 40
        : input.totalOutstanding > 5000
          ? 20
          : 0;
    score +=
      input.availableWalletBalance > 10000
        ? 40
        : input.availableWalletBalance > 5000
          ? 20
          : 0;
    score += input.totalLoans === 0 ? 10 : 0;

    return Math.max(300, Math.min(850, score));
  }

  private applyPaymentToSchedule(loan: LoanDocument, paymentAmount: number) {
    let remaining = Number(paymentAmount.toFixed(2));

    for (const installment of loan.schedule) {
      if (remaining <= 0) {
        break;
      }

      const installmentPending = Number(
        (installment.amount - (installment.paidAmount || 0)).toFixed(2),
      );

      if (installmentPending <= 0) {
        continue;
      }

      const applied = Math.min(remaining, installmentPending);

      installment.paidAmount = Number(
        ((installment.paidAmount || 0) + applied).toFixed(2),
      );

      if (installment.paidAmount >= installment.amount) {
        installment.status = 'paid';
        installment.paidAt = new Date().toISOString();
      } else {
        installment.status = 'partial';
      }

      remaining = Number((remaining - applied).toFixed(2));
    }
  }

  private async getCurrentUser(userId?: string): Promise<AuthProfile> {
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is required');
    }

    const authBase = this.configService.get<string>('services.auth') || '';
    const internalToken =
      this.configService.get<string>('security.internalAuthToken') || '';
    const url = this.joinUrl(authBase, `/internal/users/${userId}/profile`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'x-internal-auth': internalToken,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      throw new UnauthorizedException(
        error?.response?.data?.message || 'Unable to resolve authenticated user',
      );
    }
  }

  private async verifyUserPin(userId: string, pin: string): Promise<void> {
    const signatureBase =
      this.configService.get<string>('services.signatureKeys') || '';
    const internalToken =
      this.configService.get<string>('security.internalAuthToken') || '';

    const url = this.joinUrl(signatureBase, '/signature/verify');

    try {
      await firstValueFrom(
        this.httpService.post(
          url,
          { pin },
          {
            headers: {
              Authorization: `Bearer ${internalToken}`,
              'X-Internal-Auth': internalToken,
              'x-user-id': userId,
            },
          },
        ),
      );
    } catch (error: any) {
      throw new BadRequestException(
        error?.response?.data?.message || 'Invalid signature pin',
      );
    }
  }

  private async getUserWalletBalances(userId: string): Promise<any[]> {
    const walletBase =
      this.configService.get<string>('services.walletLedger') || '';
    const internalToken =
      this.configService.get<string>('security.internalAuthToken') || '';

    const url = this.joinUrl(walletBase, `/internal/wallets/user/${userId}`);

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${internalToken}`,
          'X-Internal-Auth': internalToken,
        },
      }),
    );

    return response.data?.balances || [];
  }

  private joinUrl(baseUrl: string, path: string): string {
    const base = String(baseUrl || '').replace(/\/+$/, '');
    let nextPath = String(path || '');

    if (!nextPath.startsWith('/')) {
      nextPath = '/' + nextPath;
    }

    const prefixMatch = base.match(/\/(api\/v\d+)$/i);

    if (prefixMatch) {
      const prefix = '/' + prefixMatch[1];

      if (nextPath.toLowerCase().startsWith(prefix.toLowerCase() + '/')) {
        nextPath = nextPath.slice(prefix.length);
      } else if (nextPath.toLowerCase() === prefix.toLowerCase()) {
        nextPath = '';
      }
    }

    return base + nextPath;
  }

  private addMonthsIso(date: Date, months: number): string {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next.toISOString().slice(0, 10);
  }

  private getApprovedLimitMxn(creditScore: number): number {
    const limits = this.configService.get<{
      excellent: number;
      good: number;
      medium: number;
      high: number;
    }>('loans.approvedLimits') || { excellent: 20000, good: 12000, medium: 7000, high: 3000 };

    return creditScore >= 740
      ? limits.excellent
      : creditScore >= 680
        ? limits.good
        : creditScore >= 620
          ? limits.medium
          : limits.high;
  }

  /**
   * Convierte un importe en MXN a la moneda destino consultando pricing-aggregator
   * en tiempo real (GET /prices/convert/MXN/{currency}?amount={amountMxn}).
   * Si la moneda destino es MXN devuelve el importe sin conversión.
   * Lanza BadRequestException si el aggregator no está disponible para que el
   * caller reciba un error claro en lugar de operar con una tasa incorrecta.
   */
  private async convertMxnToCurrency(amountMxn: number, currency: string): Promise<number> {
    if (currency === 'MXN') {
      return amountMxn;
    }

    const aggregatorBase =
      this.configService.get<string>('services.pricingAggregator') ||
      'http://localhost:3013/api/v1';
    const internalToken =
      this.configService.get<string>('security.internalAuthToken') || '';

    const url = this.joinUrl(aggregatorBase, `/prices/convert/MXN/${currency}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: { amount: amountMxn },
          headers: { 'x-internal-auth': internalToken },
        }),
      );

      const converted = response.data?.converted ?? response.data?.data?.converted;

      if (typeof converted !== 'number' || isNaN(converted)) {
        throw new Error('Invalid conversion response from pricing-aggregator');
      }

      return Number(converted.toFixed(8));
    } catch (error: any) {
      throw new BadRequestException(
        `No se pudo obtener la tasa de conversión MXN/${currency} desde pricing-aggregator: ${error?.response?.data?.message || error?.message || 'servicio no disponible'}`,
      );
    }
  }

  private normalizeDate(value?: Date | string): string | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }
}