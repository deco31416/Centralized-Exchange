import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [HttpModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
