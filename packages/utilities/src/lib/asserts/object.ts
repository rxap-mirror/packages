import {RxapUtilitiesError} from '../error';

export function assertIsObject(value: any, message = 'Value is not an object'): asserts value is object {
  if (!value || typeof value !== 'object') {
    throw new RxapUtilitiesError(message, '', 'assetsObject');
  }
}
