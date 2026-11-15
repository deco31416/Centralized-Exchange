import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Tipo de resolución de disputa por admin */
export type DisputeResolutionAction = 'RELEASE' | 'REFUND' | 'REJECT';
export const DISPUTE_RESOLUTION_ACTIONS: DisputeResolutionAction[] = ['RELEASE', 'REFUND', 'REJECT'];

export class ResolveDisputeDto {
  /**
   * RELEASE → liberar cripto al comprador (orden completada, vendedor pierde el hold)
   * REFUND  → devolver cripto al vendedor (cancelar la orden, escrow de vuelta al seller)
   * REJECT  → rechazar la disputa (orden vuelve a estado anterior, sin mover cripto)
   */
  @ApiProperty({
    enum: DISPUTE_RESOLUTION_ACTIONS,
    description: 'RELEASE: libera al comprador | REFUND: devuelve al vendedor | REJECT: cierra sin mover cripto',
  })
  @IsIn(DISPUTE_RESOLUTION_ACTIONS)
  resolution: DisputeResolutionAction;

  @ApiProperty({ description: 'Decisión del admin — requerida para auditoría' })
  @IsString()
  @IsNotEmpty()
  adminDecision: string;

  @ApiProperty({ description: 'Razón principal de la resolución' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Notas adicionales sobre evidencia revisada' })
  @IsOptional()
  @IsString()
  evidenceNotes?: string;
}
