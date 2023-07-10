export function Required<T>(stackOrTarget: ((this: T) => string) | any, pk?: string): any {
  if (typeof pk === 'string') {
    Object.defineProperty(stackOrTarget, pk, {
      get() {
        throw new Error(`Attribute ${pk} is required` + this.constructor.name);
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
          throw new Error(`Attribute ${propertyKey} is required` + this.constructor.name);
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
