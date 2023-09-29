import {
  ExpiredUnit,
  isBrowser,
} from '../storage-utility';
import { WebStorage } from './web-storage';

/**
 * `localStorage` Decorator
 *
 * @param [key] Storage key
 * @param [expiredAt=0] Expiration time, 0 means forever
 * @param [expiredUnit='t'] Expiration time unit (default: custom [unit: ms])
 */
export function LocalStorage(
  key?: string,
  expiredAt = 0,
  expiredUnit: ExpiredUnit = 't',
) {
  return WebStorage(isBrowser ? localStorage : null, key, expiredAt, expiredUnit);
}
