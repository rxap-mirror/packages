import {
  objectReducer,
  mergeWithMetadata
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export interface OnValueChangeMetaData {
  [controlId: string]: string[];
}

export function RxapOnValueChange(controlId: string, ...controlIds: string[]) {
  return function(target: any, propertyKey: string) {
    mergeWithMetadata(
      FormDefinitionMetaDataKeys.ON_VALUE_CHANGE,
      [ controlId, ...controlIds ].map(c => ({ [ c ]: [ propertyKey ] })).reduce(objectReducer, {}),
      target
    );
  }
}
