import {
  Observable,
  Operator,
  OperatorFunction,
  Subscriber,
  TeardownLogic,
} from 'rxjs';

/**
 * Creates an operator function that throws an error if the source Observable emits an empty value.
 *
 * This function is a higher-order function that returns an operator function specifically designed to be used with Observables.
 * When applied to an Observable, the operator function checks each emitted value, and if any value is `null` or `undefined`,
 * it throws an error with the provided message. This ensures that the resulting Observable only emits non-nullable values.
 *
 * @param {string} message - The error message to be thrown if the Observable emits an empty value.
 * @returns {OperatorFunction<T, NonNullable<T>>} An operator function that can be applied to an Observable of type T,
 * resulting in an Observable of type NonNullable<T>.
 *
 * @template T - The type of items emitted by the source Observable.
 *
 * @example
 * // Usage with an RxJS Observable
 * import { of } from 'rxjs';
 * import { throwIfEmpty } from './path/to/this/function';
 *
 * const source$ = of(null);
 * const result$ = source$.pipe(throwIfEmpty('Value cannot be empty'));
 * result$.subscribe({
 * next: value => console.log(value),
 * error: err => console.error(err)
 * });
 */
export function throwIfEmpty<T>(message: string): OperatorFunction<T, NonNullable<T>> {
  return function filterOperatorFunction(source: Observable<T>): Observable<NonNullable<T>> {
    return source.lift(new ThrowIfEmptyOperator(message));
  };
}

class ThrowIfEmptyOperator<T> implements Operator<T, T> {
  constructor(private readonly message: string) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new ThrowIfEmptySubscriber(subscriber, this.message));
  }
}

class ThrowIfEmptySubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>, private readonly message: string) {
    super(destination);
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  protected override _next(value: T) {
    let result: any;
    try {
      if (value === null || value === undefined || (value as any) === '') {
        throw new Error(this.message);
      } else {
        result = value;
      }
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
