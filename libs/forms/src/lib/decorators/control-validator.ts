import { MetadataKeys } from './metadata-keys';
import { setMetadataMapSet } from '@rxap/utilities/reflect-metadata';

export function ControlValidator(...controlIds: string[]) {

  return function(target: any, propertyKey: string) {

    for (const controlId of controlIds) {
      setMetadataMapSet(controlId, propertyKey, MetadataKeys.CONTROL_VALIDATORS, target);
    }

  };

}
