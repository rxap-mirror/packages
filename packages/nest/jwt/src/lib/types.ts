import { Request } from 'express';

export interface JwtPayload extends Record<string, unknown> {
  sub: string;
}

export function IsJwtPayload(payload: unknown): payload is JwtPayload {
  return typeof payload === 'object' && payload !== null && 'sub' in payload;
}

export interface RequestWithJwt extends Request {
  jwt: JwtPayload;
}

export function IsRequestWithJwt(request: Request): request is RequestWithJwt {
  return 'jwt' in request;
}

export interface DefaultUser {
  id: string;
  username: string;
  email: string;
}

export interface RequestWithUser<User = DefaultUser> extends Request {
  user: User;
}

export type RequestWithJwtAndUser<User = DefaultUser> = RequestWithJwt & RequestWithUser<User>;
