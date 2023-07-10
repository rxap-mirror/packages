export const PROXY_TARGET = Symbol('proxy-target');

export function GetProxyTarget<T>(object: T): T {
  return (object as any)[PROXY_TARGET];
}
