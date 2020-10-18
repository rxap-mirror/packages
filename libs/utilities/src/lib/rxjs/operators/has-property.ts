import {
  Observable,
  Subscriber,
  Operator,
  OperatorFunction,
  TeardownLogic
} from 'rxjs';
import { hasIndexSignature } from '../../has-index-signature';

export function hasProperty<T extends object | null | undefined, V>(propertyKey: keyof V, value?: any): OperatorFunction<T, T & V> {
  return function filterOperatorFunction(source: Observable<T>): Observable<T & V> {
    return source.lift(new HasPropertyOperator(propertyKey, value));
  };
}

class HasPropertyOperator<T extends object | null | undefined, V> implements Operator<T, T & V> {
  constructor(
    public readonly propertyKey: keyof V,
    public readonly value?: any
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
    public readonly value?: any
  ) {
    super(destination);
  }

  // the try catch block below is left specifically for
  // optimization and perf reasons. a tryCatcher is not necessary here.
  protected _next(value: T) {
    let result: any;
    try {
      result = value !== null &&
               value !== undefined &&
               typeof value === 'object' &&
               value.hasOwnProperty(this.propertyKey) &&
               hasIndexSignature(value) &&
               (this.value === undefined || value[ this.propertyKey as string ] === this.value);
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
