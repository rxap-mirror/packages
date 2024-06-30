import { setMetadataMap } from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import { RxapAbstractControlOptions } from '../model';
import { MetadataKeys } from './metadata-keys';

export function UseFormGroup(definition: Constructor, options: RxapAbstractControlOptions = {}) {

  return function (target: any, propertyKey: string) {

    setMetadataMap(
      propertyKey,
      {
        ...options,
        definition,
      },
      MetadataKeys.FORM_GROUPS,
      target,
    );

  };

}
