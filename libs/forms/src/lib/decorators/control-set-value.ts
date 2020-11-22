import { setMetadataMapSet } from '@rxap/utilities';
import { MetadataKeys } from './metadata-keys';

export interface ControlSetValueOptions {
  propertyKey: string;
  initial?: boolean;
}

export function ControlSetValue(controlId: string, options: Omit<ControlSetValueOptions, 'propertyKey'> = {}) {

  return function(target: any, propertyKey: string) {

    setMetadataMapSet(controlId, {
      ...options,
      propertyKey
    }, MetadataKeys.CONTROL_SET_VALUE, target);

  };

}
