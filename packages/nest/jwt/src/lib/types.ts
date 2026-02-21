import { Request } from 'express';

export interface JwtPayload extends Record<string, unknown> {
  /**
   * Issuer - Identifies the authority that issued the token.
   */
  iss?: string;
  /**
   * Subject - The unique identifier for the user or entity.
   */
  sub: string;
  /**
   * Audience - Specifies the intended recipient(s) of the token.
   */
  aud?: string | string[];
  /**
   * Expiration - The time after which the token must not be accepted.
   */
  exp?: number;
  /**
   * Not Before - The time before which the token is not yet valid.
   */
  nbf?: number;
  /**
   * Issued At - The timestamp of when the token was created.
   */
  iat?: number;
  /**
   * JWT ID - A unique ID for the token to prevent "replay" attacks.
   */
  jti?: string;

  /**
   * Authenticated At - The time at which the user authenticated.
   */
  auth_time?: number;

  /**
   * Type - The type of the token.
   */
  typ?: string;

  /**
   * Authorized Party - The party to which the ID Token was issued.
   */
  azp?: string;

  /**
   * Session ID - The session ID of the user.
   */
  sid?: string;

  /**
   * Authentication Context Class Reference - The authentication context class reference value that the authentication performed satisfied.
   */
  acr?: string;
}

export type OIDCJwtPayload = Required<Pick<JwtPayload, 'iss' | 'sub' | 'aud' | 'exp' | 'iat'>> & JwtPayload;

export type SecureJwtPayload = Required<Pick<JwtPayload, 'sub' | 'exp'>> & JwtPayload;

export function isJwtPayload(payload: unknown): payload is JwtPayload {
  return typeof payload === 'object' && !!payload;
}

/**
 * @deprecated use isJwtPayload instead
 */
export const IsJwtPayload = isJwtPayload;

export function isOIDCJwtPayload(payload: unknown): payload is JwtPayload {
  return isJwtPayload(payload) && 'iss' in payload && 'sub' in payload && 'aud' in payload && 'exp' in payload && 'iat' in payload;
}

export function isSecureJwtPayload(payload: unknown): payload is JwtPayload {
  return isJwtPayload(payload) && 'sub' in payload && 'exp' in payload;
}

export interface RequestWithJwt extends Request {
  jwt: JwtPayload;
}

export function IsRequestWithJwt(request: Request): request is RequestWithJwt {
  return 'jwt' in request && isJwtPayload(request.jwt);
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
