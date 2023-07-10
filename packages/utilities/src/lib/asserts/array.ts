import {RxapUtilitiesError} from '../error';

export function assertIsArray(value: any, message = 'Value is not an array'): asserts value is any[] {
  if (!Array.isArray(value)) {
    throw new RxapUtilitiesError(message, '', 'assertsArray');
  }
}
