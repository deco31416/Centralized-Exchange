import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { P2PAssetCatalog, P2PAssetCatalogSchema } from './schemas/p2p-asset-catalog.schema';
import { P2PAssetCatalogService } from './p2p-asset-catalog.service';
import { P2PAssetCatalogController } from './p2p-asset-catalog.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: P2PAssetCatalog.name, schema: P2PAssetCatalogSchema }]),
    SharedModule,
  ],
  controllers: [P2PAssetCatalogController],
  providers: [P2PAssetCatalogService],
  exports: [P2PAssetCatalogService],
})
export class P2PAssetCatalogModule {}
