import {
  Observable,
  Operator,
  OperatorFunction,
  Subscriber,
  TeardownLogic,
} from 'rxjs';

/**
 * Creates an operator function that filters out `null` and `undefined` values from an Observable.
 *
 * This function is a higher-order function that returns an `OperatorFunction`. The returned operator function
 * takes an Observable that emits values of type `T` and returns an Observable that emits only values of type `T`
 * that are neither `null` nor `undefined`, effectively narrowing the type from `T` to `NonNullable<T>`.
 *
 * @template T - The type of items emitted by the source Observable.
 * @returns An `OperatorFunction<T, NonNullable<T>>` that filters out `null` and `undefined` values from the source Observable.
 *
 * ### Example
 * ```typescript
 * import { of } from 'rxjs';
 * import { isDefined } from './isDefined';
 *
 * const source$ = of(1, 2, null, 3, undefined, 4);
 * const filtered$ = source$.pipe(isDefined());
 * filtered$.subscribe(console.log); // Output: 1, 2, 3, 4
 * ```
 */
export function isDefined<T>(): OperatorFunction<T, NonNullable<T>> {
  return function filterOperatorFunction(source: Observable<T>): Observable<NonNullable<T>> {
    return source.lift(new IsDefinedOperator());
  };
}

class IsDefinedOperator<T> implements Operator<T, T> {

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new IsDefinedSubscriber(subscriber));
  }
}

class IsDefinedSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  protected override _next(value: T) {
    let result: any;
    try {
      result = value !== null && value !== undefined;
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
