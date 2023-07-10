export function Member(initial: null | number | boolean | string | symbol | ((...args: any[]) => any) = null) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        Object.defineProperty(this, propertyKey, {
          value: initial,
          writable: true,
          configurable: true,
          enumerable: true,
        });
        return initial;
      },
      set(value) {
        Object.defineProperty(this, propertyKey, {value, writable: true, configurable: true, enumerable: true});
      },
      configurable: true,
      enumerable: true,
    });
  };
}

export function MemberFactory(initialFactory: (self: any) => any) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        const value = initialFactory(this);
        Object.defineProperty(this, propertyKey, {value, writable: true, configurable: true, enumerable: true});
        return value;
      },
      set(value) {
        Object.defineProperty(this, propertyKey, {value, writable: true, configurable: true, enumerable: true});
      },
      configurable: true,
      enumerable: true,
    });
  };
}
