import {
  addToMetadata,
  setMetadata
} from '@rxap/utilities';
import { FormDefinitionMetaDataKeys } from './meta-data-keys';
import { BaseFormControl } from '../../forms/form-controls/base.form-control';
import { InputFormControl } from '../../forms/form-controls/input.form-control';
import { v1 as uuid } from 'uuid';
import { Type } from '@angular/core';

export interface FormControlMetaData<FormControl extends BaseFormControl<any>> {
  propertyKey: string;
  controlId: string;
  name: string;
  formControl: Type<FormControl>;
  properties: Partial<{ [P in keyof FormControl]: FormControl[P] }>
}

export function RxapFormControl<FormControl extends BaseFormControl<any> = InputFormControl<any>>(metaData: Partial<FormControlMetaData<FormControl>> = {}) {
  return function(target: any, propertyKey: string) {
    const formControlMetaData: FormControlMetaData<FormControl> = {
      controlId:   propertyKey,
      name:        metaData.controlId || metaData.propertyKey || uuid(),
      formControl: InputFormControl as any,
      properties:  {},
      ...metaData,
      propertyKey,
    };
    addToMetadata(
      FormDefinitionMetaDataKeys.CONTROLS,
      propertyKey,
      target
    );
    setMetadata(FormDefinitionMetaDataKeys.CONTROL, formControlMetaData, target, propertyKey);
  }
}
