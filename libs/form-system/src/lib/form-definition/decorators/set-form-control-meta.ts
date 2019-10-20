import {
  getMetadata,
  setMetadata
} from '@rxap/utilities';
import { FormControlMetaData } from './control';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';

export function SetFormControlMeta<Key extends keyof FormControlMetaData<any>>(key: Key, value: FormControlMetaData<any>[Key]) {
  return function(target: any, propertyKey: string) {
    const control = getMetadata<FormControlMetaData<any>>(FormDefinitionMetaDataKeys.CONTROL, target, propertyKey);

    if (!control) {
      throw new Error(`The RxapFormControl decorator must be called before the RxapControlValidator decorator for propertyKey '${propertyKey}'`);
    }

    control[ key ] = value;

    setMetadata(FormDefinitionMetaDataKeys.CONTROL, control, target, propertyKey);

  };
}
