import {Observable, Operator, OperatorFunction, Subscriber, TeardownLogic} from 'rxjs';

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
