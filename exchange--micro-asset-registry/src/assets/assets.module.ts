import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssetsPublicController } from './assets-public.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
    ],
    controllers: [AssetsController, AssetsPublicController],
    providers: [AssetsService],
    exports: [AssetsService],
})
export class AssetsModule { }
