import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GetMovementsQueryDto } from '../../dtos/movement.dto';
import { Movement } from '../../interfaces/movement.interface';
import { P2pService } from '../../integrations/p2p/p2p.service';
import { PaymentsService } from '../../integrations/payments/payments.service';
import { RemittancesService } from '../../integrations/remittances/remittances.service';
import { SavingsService } from '../../integrations/savings/savings.service';
import { WalletService } from '../../integrations/wallet/wallet.service';

@Injectable()
export class MovementsService {
  constructor(
    private readonly walletService: WalletService,
    private readonly p2pService: P2pService,
    private readonly paymentsService: PaymentsService,
    private readonly remittancesService: RemittancesService,
    private readonly savingsService: SavingsService,
  ) {}

  async findAll(query: GetMovementsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    try {
    const [walletMovements, p2pMovements, paymentMovements, remittanceMovements, savingMovements] =
      await Promise.all([
        this.walletService.getMovements(query.userId, 1, 500),
        this.p2pService.getMovements(query.userId),
        this.paymentsService.getMovements(query.userId),
        this.remittancesService.getMovements(query.userId),
        this.savingsService.getMovements(query.userId),
      ]);

    let movements: Movement[] = [
      ...walletMovements,
      ...p2pMovements,
      ...paymentMovements,
      ...remittanceMovements,
      ...savingMovements,
    ];

    if (query.type) {
      movements = movements.filter((item) => item.type === query.type);
    }

    if (query.status) {
      const status = query.status.toLowerCase();
      movements = movements.filter(
        (item) => String(item.status).toLowerCase() === status,
      );
    }

    if (query.from) {
      const fromDate = new Date(query.from).getTime();
      movements = movements.filter(
        (item) => new Date(item.createdAt).getTime() >= fromDate,
      );
    }

    if (query.to) {
      const toDate = new Date(query.to).getTime();
      movements = movements.filter(
        (item) => new Date(item.createdAt).getTime() <= toDate,
      );
    }

    movements.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = movements.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = movements.slice(start, end);

    return {
      message: 'Movements retrieved successfully',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error retrieving movements for user ${query.userId}: ${err?.message ?? err}`,
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
    const [walletMovements, p2pMovements, paymentMovements, remittanceMovements, savingMovements] =
      await Promise.all([
        this.walletService.getMovements(userId, 1, 500),
        this.p2pService.getMovements(userId),
        this.paymentsService.getMovements(userId),
        this.remittancesService.getMovements(userId),
        this.savingsService.getMovements(userId),
      ]);

    const movements: Movement[] = [
      ...walletMovements,
      ...p2pMovements,
      ...paymentMovements,
      ...remittanceMovements,
      ...savingMovements,
    ];

    const movement = movements.find((item) => item.id === id);

    if (!movement) {
      throw new NotFoundException(`Movement with id ${id} not found`);
    }

    return {
      message: 'Movement retrieved successfully',
      data: movement,
    };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error retrieving movement ${id} for user ${userId}: ${err?.message ?? err}`,
      );
    }
  }
}