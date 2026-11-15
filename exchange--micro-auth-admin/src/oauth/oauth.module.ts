import { Module } from '@nestjs/common';
import { CryptoModule } from '../crypto/crypto.module';
import { OAuthController } from './controllers/oauth.controller';

@Module({
  imports: [CryptoModule],
  controllers: [OAuthController],
  providers: [],
  exports: [],
})
export class OAuthModule {}
