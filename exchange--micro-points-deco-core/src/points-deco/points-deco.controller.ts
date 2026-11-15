import {
  Body,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { PointOrderActionInput, PointQuoteInput } from './points-deco.interfaces';
import { PointsDecoCashService } from './points-deco-cash.service';
import { PointsDecoDisputeService } from './points-deco-dispute.service';
import { PointsDecoEconomicActionService } from './points-deco-economic-action.service';
import { PointsDecoOrderOperationsService } from './points-deco-order-operations.service';
import { PointsDecoReportService } from './points-deco-report.service';
import { PointsDecoReceiptPdfService } from './points-deco-receipt-pdf.service';
import { PointsDecoReceiptService } from './points-deco-receipt.service';
import { PointsDecoSecureFormService } from './points-deco-secure-form.service';
import { PointsDecoSettlementService } from './points-deco-settlement.service';
import { PointsDecoService } from './points-deco.service';

@Controller('points-deco')
@UseGuards(InternalAuthGuard)
export class PointsDecoController {
  constructor(
    private readonly service: PointsDecoService,
    private readonly orderOperations: PointsDecoOrderOperationsService,
    private readonly cashService: PointsDecoCashService,
    private readonly disputeService: PointsDecoDisputeService,
    private readonly economicActionService: PointsDecoEconomicActionService,
    private readonly reportService: PointsDecoReportService,
    private readonly receiptPdfService: PointsDecoReceiptPdfService,
    private readonly receiptService: PointsDecoReceiptService,
    private readonly secureFormService: PointsDecoSecureFormService,
    private readonly settlementService: PointsDecoSettlementService,
  ) {}

  @Get('overview')
  overview() {
    return this.service.overview();
  }

  @Get('points')
  listPoints(@Query() query: Record<string, string | undefined>) {
    return this.service.listPoints(query);
  }

  @Get('nearby')
  nearby(@Query() query: Record<string, string | undefined>) {
    return this.service.nearby(query);
  }

  @Post('orders/quote')
  quote(@Body() input: PointQuoteInput) {
    return this.service.quote(input);
  }

  @Post('orders')
  createOrder(@Body() input: PointQuoteInput & { userId?: string; pointId?: string }) {
    return this.service.createOrder(input);
  }

  @Get('orders')
  listOrders(@Query() query: Record<string, string | undefined>) {
    return this.service.listOrders(query);
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    const order = await this.service.getOrder(id);
    if (!order) {
      throw new NotFoundException(`Point Deco order not found: ${id}`);
    }
    return order;
  }

  @Get('orders/:id/receipt')
  getOrderReceipt(@Param('id') id: string) {
    return this.receiptService.getOrderReceipt(id);
  }

  @Get('orders/:id/receipt.pdf')
  async getOrderReceiptPdf(@Param('id') id: string, @Res() response: any) {
    const receipt = await this.receiptService.getOrderReceipt(id);
    const pdf = this.receiptPdfService.buildOrderReceiptPdf(receipt);
    const filename = `points-deco-receipt-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`;

    response.setHeader('content-type', 'application/pdf');
    response.setHeader('content-length', String(pdf.length));
    response.setHeader('content-disposition', `attachment; filename="${filename}"`);
    response.end(pdf);
  }

  @Get('orders/:id/settlement')
  getOrderSettlement(@Param('id') id: string) {
    return this.settlementService.getOrderSettlement(id);
  }

  @Post('orders/:id/accept')
  acceptOrder(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.acceptOrder(id, input);
  }

  @Post('orders/:id/reveal-location')
  revealLocation(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.revealLocation(id, input);
  }

  @Post('orders/:id/check-in')
  checkIn(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.checkIn(id, input);
  }

  @Post('orders/:id/confirm-code')
  confirmCode(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.confirmCode(id, input);
  }

  @Post('orders/:id/confirm-cash-received')
  confirmCashReceived(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.confirmCashReceived(id, input);
  }

  @Post('orders/:id/confirm-cash-delivered')
  confirmCashDelivered(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.confirmCashDelivered(id, input);
  }

  @Post('orders/:id/complete-settlement')
  completeSettlement(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.completeSettlement(id, input);
  }

  @Post('orders/:id/cancel')
  cancelOrder(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.cancelOrder(id, input);
  }

  @Post('orders/:id/dispute')
  openDispute(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.orderOperations.openDispute(id, input);
  }

  @Get('disputes')
  listDisputes(@Query() query: Record<string, string | undefined>) {
    return this.disputeService.listDisputes(query);
  }

  @Get('disputes/:id')
  getDispute(@Param('id') id: string) {
    return this.disputeService.getDispute(id);
  }

  @Post('disputes/:id/review')
  reviewDispute(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.disputeService.reviewDispute(id, input);
  }

  @Post('disputes/:id/resolve')
  resolveDispute(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.disputeService.resolveDispute(id, input);
  }

  @Post('disputes/:id/approve-resolution')
  approveResolution(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.disputeService.approveResolution(id, input);
  }

  @Post('disputes/:id/reject-resolution')
  rejectResolution(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.disputeService.rejectResolution(id, input);
  }

  @Post('disputes/:id/execute-resolution')
  executeResolution(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.disputeService.executeApprovedResolution(id, input);
  }

  @Post('disputes/:id/reject')
  rejectDispute(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.disputeService.rejectDispute(id, input);
  }

  @Get('economic-actions')
  listEconomicActions(@Query() query: Record<string, string | undefined>) {
    return this.economicActionService.listActions(query);
  }

  @Post('economic-actions/:id/queue')
  queueEconomicAction(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.economicActionService.queueForCustody(id, input);
  }

  @Post('economic-actions/:id/execute')
  executeEconomicAction(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.economicActionService.executeAction(id, input);
  }

  @Post('economic-actions/:id/reject')
  rejectEconomicAction(@Param('id') id: string, @Body() input: PointOrderActionInput) {
    return this.economicActionService.rejectAction(id, input);
  }

  @Get('reports')
  reports() {
    return this.reportService.catalog();
  }

  @Get('reports/fiscal')
  fiscalReport(@Query() query: Record<string, string | undefined>) {
    return this.reportService.fiscalSummary(query);
  }

  @Get('reports/fiscal.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="points-deco-fiscal-report.csv"')
  fiscalReportCsv(@Query() query: Record<string, string | undefined>) {
    return this.reportService.fiscalCsv(query);
  }

  @Get('reports/monthly')
  monthlyPointReport(@Query() query: Record<string, string | undefined>) {
    return this.reportService.monthlyPointSummary(query);
  }

  @Get('reports/monthly.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="points-deco-monthly-report.csv"')
  monthlyPointReportCsv(@Query() query: Record<string, string | undefined>) {
    return this.reportService.monthlyPointCsv(query);
  }

  @Get('reports/audit-export')
  auditExport(@Query() query: Record<string, string | undefined>) {
    return this.reportService.auditExport(query);
  }

  @Get('reports/audit-export.csv')
  @Header('content-type', 'text/csv; charset=utf-8')
  @Header('content-disposition', 'attachment; filename="points-deco-audit-export.csv"')
  auditExportCsv(@Query() query: Record<string, string | undefined>) {
    return this.reportService.auditExportCsv(query);
  }

  @Get('receipts')
  listReceipts(@Query() query: Record<string, string | undefined>) {
    return this.receiptService.listReceipts(query);
  }

  @Get('settlements')
  listSettlements(@Query() query: Record<string, string | undefined>) {
    return this.settlementService.listSettlements(query);
  }

  @Get('forms')
  listSecureForms(@Query() query: Record<string, string | undefined>) {
    return this.secureFormService.listForms(query);
  }

  @Post('forms')
  createSecureForm(
    @Body()
    input: {
      type?: 'source_of_funds' | 'identity_support' | 'fiscal_support' | 'dispute_support' | 'provider_evidence';
      orderId?: string;
      pointId?: string;
      userId?: string;
      submittedBy?: string;
      submittedByRole?: string;
      consentAccepted?: boolean;
      fields?: Record<string, unknown>;
      evidenceRefs?: string[];
      expiresAt?: string;
    },
  ) {
    return this.secureFormService.createForm(input);
  }

  @Post('forms/:id/review')
  reviewSecureForm(
    @Param('id') id: string,
    @Body()
    input: PointOrderActionInput & {
      status?: 'reviewing' | 'approved' | 'rejected' | 'expired';
    },
  ) {
    return this.secureFormService.reviewForm(id, input);
  }

  @Get('cash/positions')
  listCashPositions(@Query() query: Record<string, string | undefined>) {
    return this.cashService.listPositions(query);
  }

  @Get('cash/summary')
  cashSummary(@Query() query: Record<string, string | undefined>) {
    return this.cashService.summary(query);
  }

  @Get('cash/movements')
  listCashMovements(@Query() query: Record<string, string | undefined>) {
    return this.cashService.listMovements(query);
  }

  @Post('cash/adjustments')
  adjustCashPosition(
    @Body()
    input: {
      pointId?: string;
      currency?: string;
      amountMinorUnits?: string;
      reason?: string;
    } & PointOrderActionInput,
  ) {
    return this.cashService.adjustPosition(input);
  }

  @Post('cash/close-day')
  closeCashDay(
    @Body()
    input: {
      pointId?: string;
      currency?: string;
      reason?: string;
    } & PointOrderActionInput,
  ) {
    return this.cashService.closeDay(input);
  }
}
