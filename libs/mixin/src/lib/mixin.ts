import { Mixin } from './utilities';
import { mix } from './mix';
import {
  getMetadataKeys,
  getMetadata,
  hasMetadata,
  setMetadata,
  deepMerge
} from '@rxap/utilities';

/**
 * @deprecated use @Mixin instead
 */
export function mixin(...mixins: Array<Mixin<any>>) {
  return function(target: any) {
    mix(target, mixins.reverse());
  };
}

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

export function Mixin(...mixins: Array<Mixin<any>>) {
  return function(target: any) {
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
 * @deprecated use @mixin instead
 */
export function use(...mixins: Array<Mixin<any>>) {
  return function(target: any) {
    mix(target.constructor, mixins.reverse());
  };
}
