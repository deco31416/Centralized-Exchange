import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { Types } from 'mongoose';
import { AppModule } from '../app.module';
import { UserService } from '../auth/services/user.service';
import { CredentialService } from '../auth/services/credential.service';

const getEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

async function main(): Promise<void> {
  const email = getEnv('SEED_USER_EMAIL');
  const password = getEnv('SEED_USER_PASSWORD');
  const displayName = getEnv('SEED_USER_DISPLAY_NAME');
  const orgId = getEnv('SEED_USER_ORG_ID');

  if (!email || !password) {
    throw new Error(
      'Missing required env vars: SEED_USER_EMAIL and SEED_USER_PASSWORD',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const userService = app.get(UserService);
    const credentialService = app.get(CredentialService);

    const existingUser = await userService.findUserByEmail(email);

    let userId: Types.ObjectId;

    if (!existingUser) {
      const user = await userService.createUser({
        email,
        password,
        display_name: displayName,
        org_id: orgId,
      } as any);

      userId = user._id as Types.ObjectId;
      console.log(`[seed] created user: ${email} (${userId.toString()})`);

      await credentialService.createPasswordCredential(userId, password);
      console.log('[seed] password credential created');

      await userService.verifyUserEmail(userId);
      console.log('[seed] email verified / user activated (if pending)');

      return;
    }

    userId = existingUser._id as Types.ObjectId;
    console.log(`[seed] user already exists: ${email} (${userId.toString()})`);

    const hasPassword = await credentialService.hasPasswordCredential(userId);
    if (!hasPassword) {
      await credentialService.createPasswordCredential(userId, password);
      console.log('[seed] password credential created');
    } else {
      await credentialService.resetPassword(userId, password);
      console.log('[seed] password credential updated');
    }

    await userService.verifyUserEmail(userId);
    console.log('[seed] email verified / user activated (if pending)');
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[seed] failed:', err?.message || err);
  process.exitCode = 1;
});
