/**
 * @summary
 * A property decorator that creates a class member with an initial value and getter/setter functionality.
 *
 * @param initial - The initial value for the property. Can be null, a number, boolean, string, symbol, or function.
 * @default null
 *
 * @returns A decorator function that sets up the property with the specified initial value and defines getter/setter behavior.
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @Member(true)
 *   public isEnabled!: boolean;
 *
 *   @Member('default')
 *   public name!: string;
 * }
 *
 * const instance = new MyClass();
 * console.log(instance.isEnabled); // true
 * instance.isEnabled = false;
 * console.log(instance.isEnabled); // false
 * ```
 *
 * @throws Will throw a TypeError if used on something other than a class property.
 */
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
        Object.defineProperty(
          this,
          propertyKey,
          {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
          },
        );
      },
      configurable: true,
      enumerable: true,
    });
  };
}

/**
 * @summary
 * A decorator factory that creates a property with a dynamic initial value determined by a factory function.
 *
 * @param initialFactory - A factory function that receives the instance (this) as parameter and returns the initial value for the property. The factory is called once when the property is first accessed.
 *
 * @returns A property decorator function that sets up the getter and setter for the decorated property.
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @MemberFactory((instance) => new Date())
 *   public timestamp!: Date;
 * }
 *
 * const instance = new MyClass();
 * console.log(instance.timestamp); // Current date when first accessed
 * ```
 *
 * @example
 * ```typescript
 * class MyMixin {
 *   @MemberFactory((instance) => instance.computeInitialValue())
 *   public computed!: number;
 *
 *   private computeInitialValue() {
 *     return 42;
 *   }
 * }
 * ```
 *
 * @throws Will throw if the initialFactory is not a function or if it's called with invalid parameters.
 */
export function MemberFactory(initialFactory: (self: any) => any) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        const value = initialFactory(this);
        Object.defineProperty(
          this,
          propertyKey,
          {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
          },
        );
        return value;
      },
      set(value) {
        Object.defineProperty(
          this,
          propertyKey,
          {
            value,
            writable: true,
            configurable: true,
            enumerable: true,
          },
        );
      },
      configurable: true,
      enumerable: true,
    });
  };
}
