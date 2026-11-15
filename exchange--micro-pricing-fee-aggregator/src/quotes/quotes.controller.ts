import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { InternalAuthGuard } from '../shared/internal-auth.guard';

@Controller('quotes')
@UseGuards(InternalAuthGuard)
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }

    @Post()
    create(@Body() dto: CreateQuoteDto) {
        return this.quotesService.createQuote(dto);
    }

    // @Get(':id') ...
}
