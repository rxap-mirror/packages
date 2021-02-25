import { hasIndexSignature } from './has-index-signature';

export function getFromObject<T, D = undefined>(obj: object, path: string, defaultValue?: D): T | D {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return obj as any;
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

export function getFromObjectFactory<T, D = undefined>(path: string, defaultValue?: D): (obj: object) => T | D {
  return (obj: object) => getFromObject(obj, path, defaultValue);
}

export function setToObject(obj: any, path: string, value: any): void {

  const fragments: string[] = path.split('.').filter(Boolean);

  if (fragments.length === 0) {
    return;
  }

  if (obj && typeof obj === 'object') {
    const fragment: string = fragments.shift()!;

    if (obj.hasOwnProperty(fragment)) {

      if (fragments.length === 0) {
        obj[ fragment ] = value;
      } else {
        setToObject(obj[ fragment ], fragments.join('.'), value);
      }

    } else {

      if (fragments.length === 0) {
        obj[ fragment ] = value;
      } else {
        obj[ fragment ] = {};
        setToObject(obj[ fragment ], fragments.join('.'), value);
      }

    }

  }

}
