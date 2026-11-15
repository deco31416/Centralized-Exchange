import { Inject, Injectable } from '@nestjs/common';
import { AUTH_CLIENT } from '../../domain/ports/auth-client.port';
import type { AuthClientPort } from '../../domain/ports/auth-client.port';

@Injectable()
export class SearchRecipientUseCase {
  constructor(
    @Inject(AUTH_CLIENT)
    private readonly authClient: AuthClientPort,
  ) {}

  async execute(query: string) {
    const recipient = await this.authClient.searchRecipient(query);

    if (!recipient) {
      return {
        found: false,
        recipient: null,
      };
    }

    return {
      found: true,
      recipient,
    };
  }
}