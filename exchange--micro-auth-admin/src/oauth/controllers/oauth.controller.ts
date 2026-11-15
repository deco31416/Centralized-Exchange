import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  JwksResponseDto,
  OidcDiscoveryResponseDto,
} from '../../auth/dto/response.dto';
import { CryptoService } from '../../crypto/crypto.service';
import { ConfigService } from '@nestjs/config';

/**
 * OAuth 2.1 and OpenID Connect controller
 */
@Controller()
export class OAuthController {
  private readonly issuer: string;

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {
    this.issuer =
      this.configService.get<string>('JWT_ISSUER') || 'micro-ng-auth';
  }

  /**
   * OIDC Discovery endpoint
   */
  @Get('.well-known/openid-configuration')
  @HttpCode(HttpStatus.OK)
  getOidcDiscovery(@Req() req: Request): OidcDiscoveryResponseDto {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return {
      issuer: this.issuer,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
      jwks_uri: `${baseUrl}/.well-known/jwks.json`,
      scopes_supported: ['openid', 'profile', 'email'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256'],
    };
  }

  /**
   * JWKS endpoint for JWT verification
   */
  @Get('.well-known/jwks.json')
  @HttpCode(HttpStatus.OK)
  getJwks(): JwksResponseDto {
    // For simplicity, using symmetric key setup
    // In production, use asymmetric keys (RS256/EdDSA)
    return {
      keys: [
        {
          kty: 'oct',
          use: 'sig',
          alg: 'HS256',
          kid: 'main-key',
          // Note: In production, don't expose symmetric keys
          // Use asymmetric keys instead
        },
      ],
    };
  }

  /**
   * OAuth Authorization endpoint (simplified)
   */
  @Get('oauth/authorize')
  authorizeEndpoint(
    @Query('response_type') responseType: string,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('scope') scope: string,
    @Query('state') state?: string,
    @Query('code_challenge') _codeChallenge?: string,
    @Query('code_challenge_method') _codeChallengeMethod?: string,
  ): { authorize_url: string; message: string } {
    // Validate required parameters
    if (!responseType || !clientId || !redirectUri) {
      throw new BadRequestException('Missing required parameters');
    }

    if (responseType !== 'code') {
      throw new BadRequestException(
        'Only authorization code flow is supported',
      );
    }

    // In a real implementation:
    // 1. Validate client_id against registered clients
    // 2. Validate redirect_uri against registered URIs
    // 3. Show consent screen if needed
    // 4. Generate and store authorization code
    // 5. Redirect to redirect_uri with code

    const authCode = this.cryptoService.generateSecureToken();
    const params = new URLSearchParams({
      code: authCode,
      ...(state && { state }),
    });

    const authorizeUrl = `${redirectUri}?${params.toString()}`;

    return {
      authorize_url: authorizeUrl,
      message: 'In production, this would redirect after user consent',
    };
  }

  /**
   * OAuth Token endpoint
   */
  @Post('oauth/token')
  @HttpCode(HttpStatus.OK)
  tokenEndpoint(
    @Body('grant_type') grantType: string,
    @Body('code') code?: string,
    @Body('redirect_uri') redirectUri?: string,
    @Body('client_id') clientId?: string,
    @Body('code_verifier') codeVerifier?: string,
    @Body('refresh_token') refreshToken?: string,
  ): {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    id_token?: string;
  } {
    if (grantType === 'authorization_code') {
      if (!code || !redirectUri || !clientId) {
        throw new BadRequestException(
          'Missing required parameters for authorization code flow',
        );
      }

      // In a real implementation:
      // 1. Validate authorization code
      // 2. Validate PKCE if used
      // 3. Validate client and redirect URI
      // 4. Generate tokens

      const accessToken = this.cryptoService.signAccessToken({
        sub: 'user123', // Would come from auth code
        aud: 'api',
        scope: 'openid profile email',
      });

      const newRefreshToken = this.cryptoService.generateSecureToken();
      const accessTokenTtl =
        this.configService.get<number>('JWT_ACCESS_TOKEN_TTL') || 600;

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: accessTokenTtl,
        refresh_token: newRefreshToken,
        id_token: accessToken, // Simplified - should be separate ID token
      };
    }

    if (grantType === 'refresh_token') {
      if (!refreshToken) {
        throw new BadRequestException('Missing refresh token');
      }

      // In a real implementation:
      // 1. Validate refresh token
      // 2. Generate new access token
      // 3. Optionally rotate refresh token

      const accessToken = this.cryptoService.signAccessToken({
        sub: 'user123', // Would come from refresh token
        aud: 'api',
        scope: 'openid profile email',
      });

      const accessTokenTtl =
        this.configService.get<number>('JWT_ACCESS_TOKEN_TTL') || 600;

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: accessTokenTtl,
      };
    }

    throw new BadRequestException('Unsupported grant type');
  }

  /**
   * OIDC UserInfo endpoint
   */
  @Get('oauth/userinfo')
  @Post('oauth/userinfo')
  @HttpCode(HttpStatus.OK)
  userInfoEndpoint(@Req() req: Request): {
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    preferred_username?: string;
  } {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    const payload = this.cryptoService.verifyJwtToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid access token');
    }

    // In a real implementation, fetch user data from database
    return {
      sub: payload.sub,
      email: 'user@example.com',
      email_verified: true,
      name: 'John Doe',
      preferred_username: 'johndoe',
    };
  }

  /**
   * OAuth Token Introspection endpoint (RFC 7662)
   */
  @Post('oauth/introspect')
  @HttpCode(HttpStatus.OK)
  introspectEndpoint(
    @Body('token') token: string,
    @Body('token_type_hint') _tokenTypeHint?: string,
  ): {
    active: boolean;
    sub?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    scope?: string;
  } {
    if (!token) {
      throw new BadRequestException('Token parameter is required');
    }

    const payload = this.cryptoService.verifyJwtToken(token);

    if (!payload) {
      return { active: false };
    }

    return {
      active: true,
      sub: payload.sub,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat,
      scope: payload.scope,
    };
  }

  /**
   * OAuth Token Revocation endpoint (RFC 7009)
   */
  @Post('oauth/revoke')
  @HttpCode(HttpStatus.OK)
  revokeEndpoint(
    @Body('token') token: string,
    @Body('token_type_hint') _tokenTypeHint?: string,
  ): { success: boolean } {
    if (!token) {
      throw new BadRequestException('Token parameter is required');
    }

    // In a real implementation:
    // 1. Validate client authentication
    // 2. Identify token type (access or refresh)
    // 3. Revoke the token and related tokens
    // 4. Clean up sessions if needed

    return { success: true };
  }

  /**
   * Extracts Bearer token from Authorization header
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
