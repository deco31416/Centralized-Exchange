import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Quote } from './schemas/quote.schema';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { FeesService } from '../fees/fees.service';
import { OperationType, FeeType } from '../fees/schemas/fee-schedule.schema';
import { PricesService } from '../prices/prices.service';

@Injectable()
export class QuotesService {
    private readonly logger = new Logger(QuotesService.name);

    constructor(
        @InjectModel(Quote.name) private quoteModel: Model<Quote>,
        private readonly feesService: FeesService,
        private readonly pricesService: PricesService,
    ) { }

    async createQuote(dto: CreateQuoteDto): Promise<Quote> {
        const { fromAsset, toAsset, fromAmount, operation } = dto;

        // 1. Obtener conversión real delegando en PricesService (cross-rate via USD)
        // PricesService decide internamente si llamar a fiat, crypto o launchpad
        // sin duplicar lógica de categorización aquí
        let conversion: Awaited<ReturnType<PricesService['convert']>>;
        try {
            conversion = await this.pricesService.convert(fromAsset, toAsset, fromAmount);
        } catch (error) {
            this.logger.error(`Pricing unavailable for ${fromAsset}→${toAsset}: ${error.message}`);
            throw new HttpException('Pricing service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        }

        // 2. Resolver fee aplicable según jerarquía (PAIR > ASSET > NETWORK > GLOBAL)
        const opEnum = OperationType[operation as keyof typeof OperationType] || OperationType.SWAP;

        const feeSchedule = await this.feesService.resolveFee(
            opEnum,
            toAsset,
            dto.fromNetwork,
            fromAsset,
        );

        // 3. Calcular montos — conversión ya viene calculada por PricesService
        const exchangeRate = conversion.rate;
        const toAmountRaw = conversion.converted;

        // 4. Aplicar fees
        let feeValue = 0;
        let feeType = 'NONE';

        if (feeSchedule) {
            feeType = feeSchedule.feeType;
            if (feeSchedule.feeType === FeeType.PERCENTAGE) {
                feeValue = toAmountRaw * (feeSchedule.value / 100);
            } else {
                feeValue = feeSchedule.value;
            }
        }

        const toAmountNet = toAmountRaw - feeValue;

        // 5. Crear Quote
        const quote = new this.quoteModel({
            quoteId: uuidv4(),
            userId: dto.userId,
            operation,
            fromAsset,
            toAsset,
            fromAmount,
            exchangeRate,
            toAmountBeforeFees: toAmountRaw,
            fees: {
                platformFee: { value: feeValue, type: feeType },
                total: feeValue,
            },
            toAmountAfterFees: toAmountNet,
            pricingSource: conversion.fromPriceUsd != null ? 'pricing-aggregator' : 'unknown',
            feeScheduleId: feeSchedule ? feeSchedule._id : null,
            expiresAt: new Date(Date.now() + (parseInt(process.env.QUOTE_DEFAULT_TTL_SECONDS || '120', 10) * 1000)),
            used: false,
        });

        return quote.save();
    }
}
