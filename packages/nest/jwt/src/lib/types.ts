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
  sub: string;
  email: string;
}

export interface RequestWithUser<User = DefaultUser> extends Omit<Request, 'user'> {
  user: User;
}

export function isRequestWithUser<User = DefaultUser>(request: Request): request is RequestWithUser<User> {
  return 'user' in request;
}

export type RequestWithJwtAndUser<User = DefaultUser> = RequestWithJwt & RequestWithUser<User>;

export function isRequestWithJwtAndUser<User = DefaultUser>(request: Request): request is RequestWithJwtAndUser<User> {
  return IsRequestWithJwt(request) && isRequestWithUser<User>(request);
}

export function isRequestWithUserSub(request: Request): request is RequestWithUser<{ sub: string }> {
  return isRequestWithUser(request) && 'sub' in request.user;
}
