import { RxapUtilitiesError } from '../error';

// eslint-disable-next-line @typescript-eslint/ban-types
export function assertIsFunction(value: any, message = 'Value is not a function'): asserts value is Function {
  if (!value || typeof value !== 'function') {
    throw new RxapUtilitiesError(message, '', 'assertsFunction');
  }
}
