import {Observable, Operator, OperatorFunction, Subscriber, TeardownLogic} from 'rxjs';
import {hasIndexSignature} from '@rxap/utilities';

export function hasProperty<T extends object | null | undefined, V>(propertyKey: keyof V, value?: any): OperatorFunction<T, T & V> {
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
        // eslint-disable-next-line no-prototype-builtins
        value.hasOwnProperty(this.propertyKey) &&
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
