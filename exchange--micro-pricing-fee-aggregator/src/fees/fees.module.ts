import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeSchedule, FeeScheduleSchema } from './schemas/fee-schedule.schema';
import { FeesService } from './fees.service';
import { FeesAdminController } from './fees-admin.controller';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: FeeSchedule.name, schema: FeeScheduleSchema }]),
    ],
    controllers: [FeesAdminController],
    providers: [FeesService],
    exports: [FeesService],
})
export class FeesModule { }
