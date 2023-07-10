import {Constructor, Mixin} from './utilities';
import {OVERWRITE_METADATA_KEY} from './overwrite';
import {GetAllPropertyNames} from './get-all-property-names';
import {GetPropertyDescriptor} from './get-property-descriptor';
import {getMetadata} from '@rxap/reflect-metadata';

/**
 * Returns a map of property descriptors
 *
 * @param client the client Constructor
 * @param mixin the mixin object or class constructor
 * @return a map of all property descriptors of the mixin object or class
 * constructor without property descriptors with key that are included in the
 * array clientKeys
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
    throw new Error();
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
      const descriptor = GetPropertyDescriptor(prototype, key);
      return !!descriptor &&
        (descriptor.set || descriptor.get || typeof descriptor.value === 'function');
    })
    .map(key => ({[key]: GetPropertyDescriptor(prototype, key)}))
    .reduce((map: PropertyDescriptorMap, descriptor: any) => ({...map, ...descriptor}), {});

  return propertyDescriptorMap;

}
