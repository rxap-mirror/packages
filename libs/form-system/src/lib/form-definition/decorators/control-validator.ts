import {
  getMetadata,
  mergeWithMetadata,
  objectReducer
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';
import { FormControlMetaData } from '@rxap/form-system';
import { v1 as uuid } from 'uuid';

export type FormControlValidatorFunction<ControlValue> = (value: ControlValue) => any | null;

export interface ControlValidatorMetaData {
  [controlId: string]: Array<ControlValidator<any>>;
}

export interface ControlValidator<ControlValue> {
  message?: string;
  key?: string;
  validator: FormControlValidatorFunction<ControlValue>;
}

export function RxapControlValidator<ControlValue = any>(options: ControlValidator<ControlValue>) {
  return function(target: any, propertyKey: string) {
    const control = getMetadata<FormControlMetaData<any>>(FormDefinitionMetaDataKeys.CONTROL, target, propertyKey);

    if (!control) {
      throw new Error(`The RxapFormControl decorator must be called before the RxapControlValidator decorator for propertyKey '${propertyKey}'`);
    }

    mergeWithMetadata<ControlValidatorMetaData>(
      FormDefinitionMetaDataKeys.CONTROL_VALIDATOR,
      { [control.controlId]: [{ key: uuid(),...options }] },
      target
    );

  }
}
