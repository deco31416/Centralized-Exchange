import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MovementsModule } from './movements/movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MovementsModule,
  ],
})
export class AppModule {}
