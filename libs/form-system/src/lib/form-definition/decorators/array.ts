import { RxapFormDefinition } from '../form-definition';
import {
  addToMetadata,
  Type,
  Without
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export interface FormArrayMetaData {
  formDefinition: Type<RxapFormDefinition<any>>;
  propertyKey: string;
  controlId: string
}

export function RxapFormArray(formDefinitionOrMetaData: Type<RxapFormDefinition<any>> | Without<FormArrayMetaData, 'propertyKey'>) {
  return function(target: any, propertyKey: string) {
    let formArrayMetaData: FormArrayMetaData;
    if (typeof formDefinitionOrMetaData === 'function') {
      formArrayMetaData = { formDefinition: formDefinitionOrMetaData, propertyKey, controlId: propertyKey };
    } else {
      formArrayMetaData = { propertyKey, controlId: propertyKey, ...formDefinitionOrMetaData };
    }
    addToMetadata(FormDefinitionMetaDataKeys.ARRAY, formArrayMetaData, target);
  }
}
