import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';

@Module({
  imports: [HttpModule],
  controllers: [ProxyController],
  providers: [ProxyService, AdminJwtGuard],
  exports: [ProxyService],
})
export class ProxyModule {}
