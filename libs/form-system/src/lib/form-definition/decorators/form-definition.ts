import { setMetadata } from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export interface FormDefinitionMetaData {
  formId: string
}

export function RxapForm(formId: string) {
  return function(target: any) {
    setMetadata(FormDefinitionMetaDataKeys.FORM_DEFINITION, { formId }, target);
  }
}
