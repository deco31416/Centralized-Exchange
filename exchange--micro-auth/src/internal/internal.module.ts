import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { InternalController } from './internal.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [InternalController],
})
export class InternalModule {}
