import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { auth } from 'firebase-admin';
import DecodedIdToken = auth.DecodedIdToken;

/**
 * Maps the decoded id token
 */
export const GetFirebaseUser = createParamDecorator<any, any, DecodedIdToken>(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
