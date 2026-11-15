import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MovementsController } from './controllers/movements/movements.controller';
import { WalletService } from './integrations/wallet/wallet.service';
import { P2pService } from './integrations/p2p/p2p.service';
import { PaymentsService } from './integrations/payments/payments.service';
import { RemittancesService } from './integrations/remittances/remittances.service';
import { SavingsService } from './integrations/savings/savings.service';
import { MovementsService } from './services/movements/movements.service';

@Module({
  imports: [HttpModule],
  controllers: [MovementsController],
  providers: [
    MovementsService,
    WalletService,
    P2pService,
    PaymentsService,
    RemittancesService,
    SavingsService,
  ],
})
export class MovementsModule {}