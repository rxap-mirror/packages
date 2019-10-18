import { setMetadata } from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export function RxapFormTemplate(template: string) {
  return function(target: any) {
    setMetadata(FormDefinitionMetaDataKeys.FORM_TEMPLATE, template, target);
  }
}
