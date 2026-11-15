import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiUsage, ApiUsageSchema } from './schemas/api-usage.schema';
import { ApiTrackerService } from './api-tracker.service';
import { ApiTrackerController } from './api-tracker.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ApiUsage.name, schema: ApiUsageSchema },
        ]),
    ],
    controllers: [ApiTrackerController],
    providers: [ApiTrackerService],
    exports: [ApiTrackerService],
})
export class ApiTrackerModule { }
