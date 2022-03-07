import { isDevMode } from '@angular/core';

export function Deprecated(message: string) {
  return function(target: object, propertyKey: string, descriptor?: PropertyDescriptor): any {
    if (descriptor) {
      // method or getter/setter property
      if (descriptor.value && typeof descriptor.value === 'function') {
        // method
        return {
          ...descriptor,
          value: function(...args: any[]) {
            if (isDevMode()) {
              console.warn(`[${this.constructor.name}.${propertyKey}()] is deprecated!`, message);
            }
            return (descriptor.value as Function).apply(this, args);
          }
        };
      }
    } else {
      // class member
      Object.defineProperty(target, propertyKey, {
        get() {
          if (isDevMode()) {
            console.warn(`[${this.constructor.name}.${propertyKey}:get] is deprecated!`, message);
          }
          return this[ `__deprecated__${propertyKey}` ];
        },
        set(value): void {
          if (isDevMode()) {
            console.warn(`[${this.constructor.name}.${propertyKey}:set] is deprecated!`, message);
          }
          this[ `__deprecated__${propertyKey}` ] = value;
        }
      });
    }
  };
}
