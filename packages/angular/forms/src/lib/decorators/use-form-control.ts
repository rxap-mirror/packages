import {MetadataKeys} from './metadata-keys';
import {RxapAbstractControlOptions} from '../model';
import {setMetadataMap} from '@rxap/reflect-metadata';

export function UseFormControl(options: RxapAbstractControlOptions = {}) {

  return function (target: any, propertyKey: string) {

    setMetadataMap(propertyKey, options, MetadataKeys.FORM_CONTROLS, target);

  };

}

