import { Injectable } from '@nestjs/common';
import { Movement } from '../../interfaces/movement.interface';

@Injectable()
export class PaymentsService {
  async getMovements(_userId: string): Promise<Movement[]> {
    return [];
  }
}