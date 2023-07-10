import {
  Observable,
  Operator,
  OperatorFunction,
  Subscriber,
  TeardownLogic,
} from 'rxjs';

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
