import { Injectable } from '@nestjs/common';

@Injectable()
export class PointsDecoReceiptPdfService {
  buildOrderReceiptPdf(receipt: Record<string, any>): Buffer {
    const fiat = receipt.fiat ?? {};
    const cash = receipt.cash ?? {};
    const ledger = receipt.ledger ?? {};
    const evidence = receipt.evidence ?? {};

    return this.buildSimplePdf([
      'DECO EXCHANGE',
      'Comprobante operativo Puntos Deco',
      '',
      `Comprobante: ${this.value(receipt.id)}`,
      `Orden: ${this.value(receipt.orderId)}`,
      `Punto Deco: ${this.value(receipt.pointId)}`,
      `Usuario: ${this.value(receipt.userId)}`,
      `Tipo: ${this.value(receipt.type)}`,
      `Estado comprobante: ${this.value(receipt.status)}`,
      `Estado orden: ${this.value(receipt.orderStatus)}`,
      '',
      'Valores',
      `Moneda origen: ${this.value(fiat.originCurrency)}`,
      `Moneda destino: ${this.value(fiat.destinationCurrency)}`,
      `Monto origen: ${this.value(fiat.amountOrigin)}`,
      `Monto destino estimado: ${this.value(fiat.amountDestinationEstimated)}`,
      `Tasa: ${this.value(fiat.rate)}`,
      `Fee DECO: ${this.value(fiat.decoFee)}`,
      `Fee Punto Deco: ${this.value(fiat.pointFee)}`,
      '',
      'Caja y ledger',
      `Efectivo recibido: ${this.value(cash.receivedAt)}`,
      `Efectivo entregado: ${this.value(cash.deliveredAt)}`,
      `Hold requerido: ${this.value(ledger.requiresHold)}`,
      `Estado hold: ${this.value(ledger.holdStatus)}`,
      `Tx ledger: ${this.value(ledger.txId)}`,
      '',
      'Evidencia',
      `Movimientos de caja: ${this.value(evidence.cashMovements)}`,
      `Eventos auditados: ${this.value(evidence.auditTrailEvents)}`,
      `Conciliacion: ${this.value(evidence.reconciliationState)}`,
      '',
      this.value(receipt.disclaimer),
      `Generado: ${this.value(receipt.generatedAt)}`,
    ]);
  }

  private value(input: unknown) {
    if (input === null || input === undefined || input === '') return '-';
    return String(input);
  }

  private buildSimplePdf(lines: string[]) {
    const content = [
      'BT',
      '/F1 18 Tf',
      '50 780 Td',
      `(${this.escape(lines[0] ?? 'DECO EXCHANGE')}) Tj`,
      '/F1 11 Tf',
      '0 -24 Td',
      ...lines.slice(1, 42).map((line) => `(${this.escape(line)}) Tj\n0 -15 Td`),
      'ET',
    ].join('\n');

    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [];

    for (let index = 0; index < objects.length; index += 1) {
      offsets.push(Buffer.byteLength(pdf, 'latin1'));
      pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'latin1');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    pdf += offsets
      .map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`)
      .join('');
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, 'latin1');
  }

  private escape(input: string) {
    return input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }
}
