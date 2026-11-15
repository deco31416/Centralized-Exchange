import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Network, NetworkSchema } from './schemas/network.schema';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';
import { NetworksPublicController } from './networks-public.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Network.name, schema: NetworkSchema }]),
    ],
    controllers: [NetworksController, NetworksPublicController],
    providers: [NetworksService],
    exports: [NetworksService],
})
export class NetworksModule { }
