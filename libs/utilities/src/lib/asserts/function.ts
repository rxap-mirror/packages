import { RxapUtilitiesError } from '../error';

export function assertIsFunction(value: any, message: string = 'Value is not a function'): asserts value is Function {
  if (!value || typeof value !== 'function') {
    throw new RxapUtilitiesError(message, '', 'assertsFunction');
  }
}
