import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GetMovementByIdParamsDto,
  GetMovementByIdQueryDto,
  GetMovementsQueryDto,
} from '../../dtos/movement.dto';
import { MovementsService } from '../../services/movements/movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  async findAll(@Query() query: GetMovementsQueryDto) {
    return this.movementsService.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param() params: GetMovementByIdParamsDto,
    @Query() query: GetMovementByIdQueryDto,
  ) {
    return this.movementsService.findOne(params.id, query.userId);
  }
}