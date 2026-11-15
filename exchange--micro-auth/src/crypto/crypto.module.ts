import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          issuer: configService.get<string>('JWT_ISSUER'),
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  providers: [CryptoService],
  exports: [CryptoService, JwtModule],
})
export class CryptoModule {}
