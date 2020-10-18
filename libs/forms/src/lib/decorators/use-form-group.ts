import {
  setMetadataMap,
  Constructor
} from '@rxap/utilities';
import { MetadataKeys } from './metadata-keys';
import { AbstractControlOptions } from '@angular/forms';
import { RxapAbstractControlOptions } from '../model';

export function UseFormGroup(definition: Constructor, options: RxapAbstractControlOptions = {}) {

  return function(target: any, propertyKey: string) {

    setMetadataMap(
      propertyKey,
      { ...options, definition },
      MetadataKeys.FORM_GROUPS,
      target
    );

  };

}
