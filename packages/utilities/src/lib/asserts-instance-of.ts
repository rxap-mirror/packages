import { Constructor } from './helpers';

export function AssertsInstanceOf<T>(
  instance: any,
  constructor: Constructor<T>,
  constructorName: string = constructor.name,
): asserts instance is T {
  if (!(instance instanceof constructor)) {
    throw new Error(`Instance should be instance of ${ constructorName }!`);
  }
}
