import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Maps the decoded id token
 */
export const GetFirebaseUser = createParamDecorator<any, DecodedIdToken>(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
