import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NetworkDelta, NetworkDeltaSchema } from './schemas/network-delta.schema';
import { NetworkDeltasService } from './network-deltas.service';
import { NetworkDeltasController } from './network-deltas.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: NetworkDelta.name, schema: NetworkDeltaSchema },
        ]),
    ],
    controllers: [NetworkDeltasController],
    providers: [NetworkDeltasService],
    exports: [NetworkDeltasService],
})
export class NetworkDeltasModule { }
