import { setMetadataMap } from '@rxap/utilities';
import { MetadataKeys } from './metadata-keys';
import { RxapAbstractControlOptions } from '../model';

export function UseFormControl(options: RxapAbstractControlOptions = {}) {

  return function(target: any, propertyKey: string) {

    setMetadataMap(propertyKey, options, MetadataKeys.FORM_CONTROLS, target);

  };

}

