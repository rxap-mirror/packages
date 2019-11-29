import {
  Observable,
  Subscriber,
  Operator,
  OperatorFunction,
  TeardownLogic
} from 'rxjs';

export function isNotEmpty<T>(): OperatorFunction<T, NonNullable<T>> {
  return function filterOperatorFunction(source: Observable<T>): Observable<NonNullable<T>> {
    return source.lift(new IsNotEmptyOperator());
  };
}

class IsNotEmptyOperator<T> implements Operator<T, T> {
  constructor() {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new IsNotEmptySubscriber(subscriber));
  }
}

export class IsNotEmptySubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>) {
    super(destination);
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  _next(value: T) {
    let result: any;
    try {
      result = value !== null && value !== undefined && (typeof value !== 'string' || value !== '');
    } catch (err) {
      // tslint:disable-next-line:no-non-null-assertion
      this.destination.error!(err);
      return;
    }
    if (result) {
      // tslint:disable-next-line:no-non-null-assertion
      this.destination.next!(value);
    }
  }
}
