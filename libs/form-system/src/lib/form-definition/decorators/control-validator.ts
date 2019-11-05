import {
  getMetadata,
  mergeWithMetadata,
  KeyValue
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';
import { FormControlMetaData } from './control';
import { v1 as uuid } from 'uuid';


/**
 * true -> value is valid
 * string -> value is invalid and error message
 * null -> value is valid
 * false -> value is invalid
 */
export type FormControlValidatorFunction<ControlValue> = (value: ControlValue | null) => true | string | null | false;

export type ControlValidatorMetaData = KeyValue<Array<ControlValidator<any>>>

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
