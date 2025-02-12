import { Mixin } from './utilities';
import { mix } from './mix';
import { deepMerge } from '@rxap/utilities';
import {
  getMetadata,
  getMetadataKeys,
  hasMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';

/**
 * @summary
 * A decorator function that applies mixins to a target class, allowing for composition of functionality from multiple sources.
 *
 * @param {...Mixin<any>} mixins - An array of mixin classes or objects to be applied to the target class. Mixins are applied in reverse order, meaning the last mixin in the array will be applied first.
 *
 * @returns A decorator function that when applied to a class will mix in the functionality from the provided mixins.
 *
 * @example
 * ```typescript
 * class DisableFeature {
 *   public disabled = false;
 *   public disable(): void {
 *     this.disabled = true;
 *   }
 * }
 *
 * class ValidateFeature {
 *   public isValid = true;
 *   public validate(): void {}
 * }
 *
 * interface Concrete extends DisableFeature, ValidateFeature {}
 *
 * @mixin(DisableFeature, ValidateFeature)
 * class Concrete {}
 *
 * const concrete = new Concrete();
 * concrete.disable(); // Method from DisableFeature is available
 * concrete.validate(); // Method from ValidateFeature is available
 * ```
 *
 * @throws Will throw an error if any of the mixins are not valid objects or constructor functions.
 */
export function mixin(...mixins: Array<Mixin<any>>) {
  return function (target: any) {
    mix(target, mixins.reverse());
  };
}

/**
 * @summary
 * Copies metadata from a source object to a target object, with support for merging array and object metadata.
 *
 * @param source - The source object from which to copy metadata
 * @param target - The target object to which the metadata should be copied
 *
 * @example
 * ```typescript
 * class Source {
 *   // Has metadata with key 'example' and value ['item1']
 * }
 *
 * class Target {
 *   // Has metadata with key 'example' and value ['item2']
 * }
 *
 * CopyMetadata(Source, Target);
 * // Target now has metadata 'example' with value ['item2', 'item1']
 * ```
 *
 * @throws Will throw an error if the metadata retrieval fails or if the metadata types are incompatible during merging
 */
function CopyMetadata(source: any, target: any) {
  const keys = getMetadataKeys(source);
  if (keys.length) {
    for (const key of keys) {
      const sourceMetadata = getMetadata(key, source)!;
      if (!hasMetadata(key, target)) {
        setMetadata(key, sourceMetadata, target);
      } else {
        const targetMetadata = getMetadata(key, target)!;
        if (Array.isArray(targetMetadata) && Array.isArray(sourceMetadata)) {
          setMetadata(key, [ ...targetMetadata, ...sourceMetadata ], target);
        } else {
          const mergedMetadata = deepMerge(targetMetadata, sourceMetadata);
          setMetadata(key, mergedMetadata, target);
        }
      }
    }
  }
}

/**
 * @summary
 * A decorator function that applies mixins to a target class and copies metadata from the mixins to the target.
 *
 * @param mixins - An array of mixins to apply. Each mixin can be either a constructor (class) or an object.
 *
 * @returns A class decorator function that when applied will mix in the provided mixins and their metadata.
 *
 * @example
 * ```typescript
 * class DisableFeature {
 *   public disabled = false;
 *   public disable(): void {
 *     this.disabled = true;
 *   }
 * }
 *
 * @Mixin(DisableFeature)
 * class MyClass {
 *   // MyClass now has the properties and methods from DisableFeature
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Multiple mixins can be applied
 * class ValidateFeature {
 *   public isValid = true;
 *   public validate(): void {}
 * }
 *
 * @Mixin(DisableFeature, ValidateFeature)
 * class MyClass {
 *   // MyClass now has properties and methods from both mixins
 * }
 * ```
 *
 * @throws Will throw an error if a mixin is neither a class (function) nor an object.
 */
export function Mixin(...mixins: Array<Mixin<any>>) {
  return function (target: any) {
    mix(target, mixins.reverse());
    for (const source of mixins.reverse()) {
      CopyMetadata(source, target);
      if (typeof source === 'function') {
        CopyMetadata(source.prototype, target.prototype);
      }
    }
  };
}

/**
 * @summary
 * A decorator function that applies mixins to a class instance, allowing for the extension of functionality through composition.
 *
 * @param mixins - An array of mixins to be applied. Each mixin can be either a constructor (class) or an object containing methods and properties to be mixed in. The mixins are applied in reverse order, meaning the last mixin in the array is applied first.
 *
 * @returns A decorator function that when applied to a class will mix in the specified functionality from the provided mixins.
 *
 * @example
 * ```typescript
 * class DisableFeature {
 *   public disabled = false;
 *   public disable(): void {
 *     this.disabled = true;
 *   }
 * }
 *
 * @use(DisableFeature)
 * class MyComponent {
 *   // The class now has access to the DisableFeature functionality
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Multiple mixins can be applied
 * class ValidateFeature {
 *   public isValid = true;
 *   public validate(): void {}
 * }
 *
 * @use(DisableFeature, ValidateFeature)
 * class MyComponent {
 *   // The class now has both DisableFeature and ValidateFeature functionality
 * }
 * ```
 */
export function use(...mixins: Array<Mixin<any>>) {
  return function (target: any) {
    mix(target.constructor, mixins.reverse());
  };
}
