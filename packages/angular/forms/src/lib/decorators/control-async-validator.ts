import { MetadataKeys } from './metadata-keys';
import { setMetadataMapSet } from '@rxap/reflect-metadata';

export function ControlAsyncValidator(...controlIds: string[]) {

  return function (target: any, propertyKey: string) {

    for (const controlId of controlIds) {
      setMetadataMapSet(controlId, propertyKey, MetadataKeys.CONTROL_ASYNC_VALIDATORS, target);
    }

  };

}
