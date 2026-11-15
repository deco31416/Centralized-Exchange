import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes as public (skip authentication)
 */
export const Public = () => SetMetadata('isPublic', true);
