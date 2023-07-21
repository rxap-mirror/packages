import { SetToObject } from './object/set-to-object';

/**
 * @deprecated Use SetToObject instead
 */
export function SetObjectValue(obj: any, path: string, value: any): void {
  SetToObject(obj, path, value);
}
