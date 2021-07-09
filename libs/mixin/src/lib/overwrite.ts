import {
  addToMetadata,
  setMetadata
} from '@rxap/utilities/reflect-metadata';

export const OVERWRITE_METADATA_KEY = 'rxap-mixin-overwrite';

export function Overwrite(onlySelf: boolean = true) {
  return function(target: any, propertyKey: string) {
    addToMetadata(OVERWRITE_METADATA_KEY, propertyKey, target);
    setMetadata(OVERWRITE_METADATA_KEY, onlySelf, target, propertyKey);
  };
}
