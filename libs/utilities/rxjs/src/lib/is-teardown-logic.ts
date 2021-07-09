import { TeardownLogic } from 'rxjs';

export function isTeardownLogic(obj: any): obj is TeardownLogic {
  return typeof obj === 'function' || (typeof obj === 'object' && obj && typeof obj.unsubscribe === 'function');
}
