import { setMetadataMap } from '@rxap/reflect-metadata';
import { Constructor } from '@rxap/utilities';
import { RxapAbstractControlOptions } from '../model';
import { MetadataKeys } from './metadata-keys';

export function UseFormArrayGroup(definition: Constructor, options: RxapAbstractControlOptions = {}) {

  return function (target: any, propertyKey: string) {

    setMetadataMap(
      propertyKey,
      {
        ...options,
        definition,
      },
      MetadataKeys.FORM_ARRAY_GROUPS,
      target,
    );

  };

}

export function UseFormArrayControl(options: RxapAbstractControlOptions = {}) {

  return function (target: any, propertyKey: string) {

    setMetadataMap(propertyKey, options, MetadataKeys.FORM_ARRAY_CONTROLS, target);

  };

}
