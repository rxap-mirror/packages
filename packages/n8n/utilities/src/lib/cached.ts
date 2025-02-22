import Keyv from 'keyv';

export interface CacheOptions {
  disabled?: boolean;
  keyv?: Keyv;
  ttl?: number;
}

export async function cached<Fn extends (...args: Parameters<Fn>) => ReturnType<Fn>>(
  { disabled, keyv, ttl }: CacheOptions,
  fn: Fn,
  ...args: Parameters<Fn>
): Promise<ReturnType<Fn>> {

  if (disabled || !keyv) {
    return fn(...args);
  }

  const key = JSON.stringify(args);

  if (await keyv.has(key)) {
    const cached = (await keyv.get(key))!;
    cached['__cache__'] = true;
    return cached;
  }

  const result = await fn(...args);
  await keyv.set(key, result, ttl);
  return result;
}
