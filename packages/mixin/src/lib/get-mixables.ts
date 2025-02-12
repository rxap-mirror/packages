import {
  Constructor,
  Mixin,
} from './utilities';
import { OVERWRITE_METADATA_KEY } from './overwrite';
import { GetAllPropertyNames } from './get-all-property-names';
import { GetPropertyDescriptor } from './get-property-descriptor';
import { getMetadata } from '@rxap/reflect-metadata';

/**
 * @summary
 * Returns a map of property descriptors from a mixin that can be applied to a client class, handling property overwriting rules and filtering based on property types.
 *
 * @param client - The target constructor class that will receive the mixin properties
 * @param mixin - The source mixin, which can be either a constructor class or an object containing properties to be mixed in
 *
 * @returns A PropertyDescriptorMap containing all valid property descriptors that can be mixed in, filtered based on overwrite rules and property types
 *
 * @throws Error when the mixin parameter is neither a class (function) nor an object
 *
 * @example
 * ```typescript
 * class MyMixin {
 *   public getName() { return 'name'; }
 *   public get value() { return 42; }
 * }
 *
 * class Target {
 *   constructor() {}
 * }
 *
 * const mixables = getMixables(Target, MyMixin);
 * // Returns property descriptors for 'getName' and 'value'
 * ```
 *
 * @example
 * ```typescript
 * class MyMixin {
 *   @Overwrite()
 *   public getValue() { return 42; }
 * }
 *
 * class Target {
 *   public getValue() { return 0; }
 * }
 *
 * const mixables = getMixables(Target, MyMixin);
 * // Returns property descriptor for 'getValue' due to @Overwrite decorator
 * ```
 */
export function getMixables(client: Constructor<any>, mixin: Mixin<any>): PropertyDescriptorMap {

  const clientKeys: string[] = GetAllPropertyNames(client.prototype);
  let overwriteKeys: string[] = [];
  let onlyOwnClientKeys: string[] = [];

  let prototype: object | null;

  switch (typeof mixin) {

    case 'object':
      prototype = mixin;
      break;

    case 'function':
      prototype = (mixin as Constructor<any>).prototype;
      // only if the mixin is a class the overwrite decorator can be used
      overwriteKeys = getMetadata<string[]>(OVERWRITE_METADATA_KEY, prototype) || [];
      onlyOwnClientKeys = Object.getOwnPropertyNames(client.prototype);
      break;

    default:
      prototype = null;
      break;

  }

  if (prototype === null) {
    throw new Error(`The mixin is typeof '${typeof mixin}' but must be a class (function) or an object!`);
  }

  const mixinKeys = GetAllPropertyNames(prototype);

  const propertyDescriptorMap: PropertyDescriptorMap = mixinKeys.filter(key => {

                                                                  if (clientKeys.includes(key)) {

                                                                    if (!overwriteKeys.includes(key)) {
                                                                      // propertyKey is already defined in the client prototype
                                                                      // and is not mark with overwrite
                                                                      return false;
                                                                    }

                                                                    const onlySelf = !!getMetadata(OVERWRITE_METADATA_KEY, prototype, key);

                                                                    if (onlySelf) {

                                                                      if (onlyOwnClientKeys.includes(key)) {
                                                                        // if the parent client keys not contain the propertyKey the
                                                                        // client has this property direct defined
                                                                        return false;
                                                                      }

                                                                    }

                                                                  }

                                                                  return true;
                                                                })
                                                                .filter(key => {
                                                                  const descriptor = GetPropertyDescriptor(
                                                                    prototype,
                                                                    key,
                                                                  );
                                                                  return !!descriptor &&
                                                                    (descriptor.set ||
                                                                      descriptor.get ||
                                                                      typeof descriptor.value ===
                                                                      'function');
                                                                })
                                                                .map(key => ({
                                                                  [key]: GetPropertyDescriptor(
                                                                    prototype,
                                                                    key,
                                                                  ),
                                                                }))
                                                                .reduce((
                                                                  map: PropertyDescriptorMap,
                                                                  descriptor: any,
                                                                ) => ({ ...map, ...descriptor }), {});

  return propertyDescriptorMap;

}
