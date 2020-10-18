export function DebounceCall(delay: number = 300): MethodDecorator {
  return function(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {

    if (typeof propertyKey === 'string') {
      const original = descriptor.value;
      const key      = `__timeout__${propertyKey}`;

      descriptor.value = function(...args: any[]) {
        clearTimeout(Reflect.get(this, key));
        Reflect.set(this, key, setTimeout(() => original.apply(this, args), delay));
      };

    }

    return descriptor;
  };
}
