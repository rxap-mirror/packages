import { hasIndexSignature } from './has-index-signature';

export function getFromObject<T, D = undefined>(obj: any, path: string, defaultValue?: D): T | D {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return obj;
  }

  if (!obj) {
    return defaultValue as any;
  }

  if (typeof obj !== 'object') {
    return defaultValue as any;
  }

  const fragment: string = fragments.shift()!;

  if (obj.hasOwnProperty(fragment) && hasIndexSignature(obj)) {
    return getFromObject(obj[ fragment ], fragments.join('.'), defaultValue);
  }

  return defaultValue as any;

}
