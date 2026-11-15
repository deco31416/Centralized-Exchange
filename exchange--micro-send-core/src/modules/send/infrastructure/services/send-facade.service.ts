import { Injectable } from '@nestjs/common';
import { DecoQuoteDto } from '../../application/dto/deco-quote.dto';
import { DecoExecuteDto } from '../../application/dto/deco-execute.dto';
import { BankQuoteDto } from '../../application/dto/bank-quote.dto';
import { BankExecuteDto } from '../../application/dto/bank-execute.dto';
import { SpeiQuoteDto } from '../../application/dto/spei-quote.dto';
import { SpeiExecuteDto } from '../../application/dto/spei-execute.dto';
import { WalletQuoteDto } from '../../application/dto/wallet-quote.dto';
import { WalletExecuteDto } from '../../application/dto/wallet-execute.dto';
import { QuoteDecoUseCase } from '../../application/use-cases/quote-deco.use-case';
import { ExecuteDecoUseCase } from '../../application/use-cases/execute-deco.use-case';
import { QuoteBankUseCase } from '../../application/use-cases/quote-bank.use-case';
import { ExecuteBankUseCase } from '../../application/use-cases/execute-bank.use-case';
import { QuoteSpeiUseCase } from '../../application/use-cases/quote-spei.use-case';
import { ExecuteSpeiUseCase } from '../../application/use-cases/execute-spei.use-case';
import { QuoteWalletUseCase } from '../../application/use-cases/quote-wallet.use-case';
import { ExecuteWalletUseCase } from '../../application/use-cases/execute-wallet.use-case';

@Injectable()
export class SendFacadeService {
  constructor(
    private readonly QuoteDecoUseCase: QuoteDecoUseCase,
    private readonly ExecuteDecoUseCase: ExecuteDecoUseCase,
    private readonly quoteBankUseCase: QuoteBankUseCase,
    private readonly executeBankUseCase: ExecuteBankUseCase,
    private readonly quoteSpeiUseCase: QuoteSpeiUseCase,
    private readonly executeSpeiUseCase: ExecuteSpeiUseCase,
    private readonly quoteWalletUseCase: QuoteWalletUseCase,
    private readonly executeWalletUseCase: ExecuteWalletUseCase,
  ) {}

  quotedeco(dto: DecoQuoteDto) {
    return this.QuoteDecoUseCase.execute(dto);
  }

  executedeco(dto: DecoExecuteDto) {
    return this.ExecuteDecoUseCase.execute(dto);
  }

  quoteBank(dto: BankQuoteDto) {
    return this.quoteBankUseCase.execute(dto);
  }

  executeBank(dto: BankExecuteDto) {
    return this.executeBankUseCase.execute(dto);
  }

  quoteSpei(dto: SpeiQuoteDto) {
    return this.quoteSpeiUseCase.execute(dto);
  }

  executeSpei(dto: SpeiExecuteDto) {
    return this.executeSpeiUseCase.execute(dto);
  }

  quoteWallet(dto: WalletQuoteDto) {
    return this.quoteWalletUseCase.execute(dto);
  }

  executeWallet(dto: WalletExecuteDto) {
    return this.executeWalletUseCase.execute(dto);
  }
}