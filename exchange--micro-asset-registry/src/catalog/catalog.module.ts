import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { AssetsModule } from '../assets/assets.module';
import { NetworksModule } from '../networks/networks.module';

@Module({
    imports: [AssetsModule, NetworksModule],
    controllers: [CatalogController],
})
export class CatalogModule { }
