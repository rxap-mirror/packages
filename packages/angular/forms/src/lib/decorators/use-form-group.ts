import { Constructor } from '@rxap/utilities';
import { MetadataKeys } from './metadata-keys';
import { RxapAbstractControlOptions } from '../model';
import { setMetadataMap } from '@rxap/reflect-metadata';

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
