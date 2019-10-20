import { RxapFormDefinition } from '../form-definition';
import {
  addToMetadata,
  Type,
  Without
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export interface FormGroupMetaData {
  formDefinition: Type<RxapFormDefinition<any>>;
  propertyKey: string;
  controlId: string;
}

export function RxapFormGroup(formDefinitionOrMetaData: Type<RxapFormDefinition<any>> | Without<FormGroupMetaData, 'propertyKey'>) {
  return function(target: any, propertyKey: string) {
    let formGroupMetaData: FormGroupMetaData;
    if (typeof formDefinitionOrMetaData === 'function') {
      formGroupMetaData = { formDefinition: formDefinitionOrMetaData, propertyKey, controlId: propertyKey };
    } else {
      formGroupMetaData = { propertyKey, controlId: propertyKey, ...formDefinitionOrMetaData };
    }
    addToMetadata(FormDefinitionMetaDataKeys.GROUP, formGroupMetaData, target);
  }
}
