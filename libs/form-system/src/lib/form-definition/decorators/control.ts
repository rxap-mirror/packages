import {
  addToMetadata,
  setMetadata
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';
import { BaseFormControl } from '../../forms/form-controls/base.form-control';
import { InputFormControl } from '../../forms/form-controls/input.form-control';
import { Type } from '@angular/core';

export interface FormControlMetaData<FormControl extends BaseFormControl<any>> {
  propertyKey: string;
  controlId: string;
  formControl: Type<FormControl>;
  options: Partial<{ [P in keyof FormControl]: FormControl[P] }>
}

export function RxapFormControl<FormControl extends BaseFormControl<any> = InputFormControl<any>>(metaData: Partial<FormControlMetaData<FormControl>> = {}) {
  return function(target: any, propertyKey: string) {
    const formControlMetaData: FormControlMetaData<FormControl> = {
      controlId: propertyKey,
      formControl: InputFormControl as any,
      options: {},
      ...metaData,
      propertyKey,
    };
    addToMetadata(
      FormDefinitionMetaDataKeys.CONTROLS,
      formControlMetaData,
      target
    );
    setMetadata(FormDefinitionMetaDataKeys.CONTROL, formControlMetaData, target, propertyKey);
  }
}
