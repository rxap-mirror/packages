// rxap-no-index-export
// eslint-disable-next-line @typescript-eslint/ban-types
/**
 * A generic interface that represents a constructor function type.
 *
 * @typeParam T - The type of instance that will be created by the constructor
 *
 * @property new - A constructor signature that creates a new instance of type T
 * @property args - The constructor parameters of any type
 *
 * @example
 * ```typescript
 * class MyClass {}
 * const ctor: Constructor<MyClass> = MyClass;
 * const instance = new ctor();
 * ```
 *
 * @example
 * ```typescript
 * interface IService {}
 * class Service implements IService {}
 *
 * function factory(ctor: Constructor<IService>) {
 *   return new ctor();
 * }
 *
 * const service = factory(Service);
 * ```
 */
export interface Constructor<T> extends Function {
  new(...args: any[]): T;
}

/**
 * A type that represents either a class constructor or an object that can be used as a mixin.
 *
 * @typeParam T - The type of the instance that will be created by the constructor or the type of the object
 *
 * @example
 * ```typescript
 * class MyMixin {
 *   method() {}
 * }
 *
 * // Can be used as a class constructor mixin
 * const classMixin: Mixin<MyMixin> = MyMixin;
 *
 * // Or as an object mixin
 * const objectMixin: Mixin<{ method: () => void }> = {
 *   method() {}
 * };
 * ```
 */
export type Mixin<T> = Constructor<T> | object;
