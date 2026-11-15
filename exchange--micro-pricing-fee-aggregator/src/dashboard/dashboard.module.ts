import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DashboardController } from './dashboard.controller';
import { InternalAuthGuard } from '../shared/internal-auth.guard';

@Module({
    imports: [ConfigModule],
    controllers: [DashboardController],
    providers: [InternalAuthGuard],
})
export class DashboardModule {}
