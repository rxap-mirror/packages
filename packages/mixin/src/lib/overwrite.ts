import {
  addToMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';

export const OVERWRITE_METADATA_KEY = 'rxap-mixin-overwrite';

/**
 * A decorator that marks a property or method in a mixin class to be overwritten in the target class.
 *
 * @summary
 * Controls how mixin properties override existing properties in the target class.
 *
 * @param onlySelf - If true (default), the property will only be overwritten if it is directly defined in the target class. If false, the property will be overwritten regardless of whether it is inherited or directly defined.
 *
 * @returns A decorator function that can be applied to class properties or methods.
 *
 * @example
 * ```typescript
 * class MyMixin {
 *   // Will only overwrite if target class directly defines getOnlySelf
 *   @Overwrite()
 *   public getOnlySelf() {}
 *
 *   // Will overwrite regardless of inheritance
 *   @Overwrite(false)
 *   public getAll() {}
 * }
 * ```
 *
 * @example
 * ```typescript
 * class Parent {
 *   public getAll() {}
 *   public getOnlySelf() {}
 * }
 *
 * class Child extends Parent {
 *   // MyMixin.getOnlySelf will not overwrite this
 *   public getOnlySelf() {}
 *   // MyMixin.getAll will overwrite Parent.getAll
 * }
 * ```
 */
export function Overwrite(onlySelf = true) {
  return function (target: any, propertyKey: string) {
    addToMetadata(OVERWRITE_METADATA_KEY, propertyKey, target);
    setMetadata(OVERWRITE_METADATA_KEY, onlySelf, target, propertyKey);
  };
}
