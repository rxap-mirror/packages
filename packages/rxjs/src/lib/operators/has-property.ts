import {
  Observable,
  Operator,
  OperatorFunction,
  Subscriber,
  TeardownLogic,
} from 'rxjs';
import { hasIndexSignature } from '@rxap/utilities';

/**
 * Creates an operator function that filters an Observable stream, emitting only those items from the source Observable
 * that have a specified property, optionally checking if the property's value matches a given value.
 *
 * @template T The type of the items emitted by the source Observable, which must be an object, or null, or undefined.
 * @template V The type of the object specifying the property to check for in the items emitted by the source Observable.
 * @param propertyKey The property key to check for in the emitted items. This key must exist in type V.
 * @param value Optional. The value to compare against the property's value. If provided, only items where the property's
 * value matches this argument will be emitted.
 * @returns An OperatorFunction that takes a source Observable of type T and returns an Observable of type T & V,
 * emitting only items that have the specified property, and if a value is provided, where the property's value
 * matches the provided value.
 *
 * ### Example
 * ```typescript
 * // Assuming an Observable of objects with type {id: number, name: string}
 * const source$ = of({id: 1, name: 'Alice'}, {id: 2, name: 'Bob'});
 * const filtered$ = source$.pipe(hasProperty<'name'>('name'));
 * // filtered$ will emit both objects as they both have the 'name' property.
 * ```
 *
 * ### Note
 * - The function uses the `HasPropertyOperator` class internally to perform the filtering.
 * - If `value` is provided, strict equality (===) is used for comparison.
 *
 */
export function hasProperty<T extends object | null | undefined, V>(
  propertyKey: keyof V,
  value?: any,
): OperatorFunction<T, T & V> {
  return function filterOperatorFunction(source: Observable<T>): Observable<T & V> {
    return source.lift(new HasPropertyOperator(propertyKey, value));
  };
}

class HasPropertyOperator<T extends object | null | undefined, V> implements Operator<T, T & V> {
  constructor(
    public readonly propertyKey: keyof V,
    public readonly value?: any,
  ) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new HasPropertySubscriber(subscriber, this.propertyKey, this.value));
  }
}

class HasPropertySubscriber<T extends object | null | undefined, V> extends Subscriber<T> {

  constructor(
    destination: Subscriber<T>,
    public readonly propertyKey: keyof V,
    public readonly value?: any,
  ) {
    super(destination);
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  protected override _next(value: T) {
    let result: any;
    try {
      result = value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        Object.prototype.hasOwnProperty.call(value, this.propertyKey) &&
        hasIndexSignature(value) &&
        (this.value === undefined || value[this.propertyKey as string] === this.value);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.destination.error!(err);
      return;
    }
    if (result) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.destination.next!(value);
    }
  }
}
