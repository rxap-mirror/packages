import {MetadataKeys} from './metadata-keys';
import {setMetadataMapSet} from '@rxap/reflect-metadata';

export function ControlChange(...controlIds: string[]) {

  return function (target: any, propertyKey: string) {

    for (const controlId of controlIds) {
      setMetadataMapSet(controlId, propertyKey, MetadataKeys.CONTROL_CHANGES, target);
    }

  };

}
