import {RxapUtilitiesError} from '../error';

function required(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    get() {
      throw new RxapUtilitiesError(`Attribute ${propertyKey} is required`, '', this.constructor.name);
    },
    set(value) {
      Object.defineProperty(this, propertyKey, {value, writable: true, configurable: true, enumerable: true});
    },
    configurable: true,
    enumerable: true,
  });
}

export function Required<T>(stackOrTarget: ((this: T) => string) | any, pk?: string): any {
  if (typeof pk === 'string') {
    Object.defineProperty(stackOrTarget, pk, {
      get() {
        throw new RxapUtilitiesError(`Attribute ${pk} is required`, '', this.constructor.name);
      },
      set(value) {
        Object.defineProperty(this, pk, {value, writable: true, configurable: true, enumerable: true});
      },
      configurable: true,
      enumerable: true,
    });
  } else {
    return function (target: any, propertyKey: string) {
      Object.defineProperty(target, propertyKey, {
        get() {
          throw new RxapUtilitiesError(`Attribute ${propertyKey} is required`, '', this.constructor.name, stackOrTarget.call(this));
        },
        set(value) {
          Object.defineProperty(this, propertyKey, {value, writable: true, configurable: true, enumerable: true});
        },
        configurable: true,
        enumerable: true,
      });
    };
  }
}

export function IsRequiredPropertyDefined<T extends object>(obj: T, propertyKey: keyof T): boolean {
  // check if the component has already a FormControl instance assigned
  // It is required to test this with property descriptor, bs the
  // @Required decorator is used on the control property
  const descriptor = Object.getOwnPropertyDescriptor(obj, propertyKey);
  // eslint-disable-next-line no-prototype-builtins
  return !!descriptor && descriptor.hasOwnProperty('value');
}
