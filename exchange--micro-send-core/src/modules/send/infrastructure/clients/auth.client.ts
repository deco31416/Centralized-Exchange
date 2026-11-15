import { Injectable } from '@nestjs/common';
import { AuthPort } from '../../application/ports/auth.port';
import { BaseHttpClientService } from '../services/base-http-client.service';

@Injectable()
export class AuthClient
  extends BaseHttpClientService
  implements AuthPort
{
  async validateUser(userId: string): Promise<{ valid: boolean; userId: string }> {
    const baseUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:7000/api/v1';

    const response = await this.request<{
      userId: string;
      status?: string;
    }>({
      baseUrl,
      path: `/internal/users/${userId}/profile`,
      source: 'auth',
      headers: this.buildInternalHeaders(),
      allow404: true,
    });

    if (!response) {
      return { valid: false, userId };
    }

    return {
      valid: response.status ? response.status.toUpperCase() === 'ACTIVE' : true,
      userId: response.userId || userId,
    };
  }
}