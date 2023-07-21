import { Request } from 'express';

export interface RequestWithJwt extends Request {
  jwt: { sub: string } & Record<string, unknown>;
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
