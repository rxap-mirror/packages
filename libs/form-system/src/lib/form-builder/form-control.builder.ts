import { Injectable } from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { FormControlMetaData } from '../form-definition/decorators/control';
import {
  objectReducer,
  KeyValue,
  Type
} from '@rxap/utilities';
import { FormStateManager } from '../form-state-manager';
import { ParentForm } from '../forms/parent.form';

@Injectable({ providedIn: 'root' })
export class FormControlBuilder {

  constructor(
    public readonly formStateManager: FormStateManager,
  ) {}

  public buildControl(
    controlMetaData: FormControlMetaData<any>,
    parent: ParentForm<any>
  ): BaseFormControl<any> {
    const FormControlType: Type<BaseFormControl<any>> = controlMetaData.formControl;
    const control: BaseFormControl<any>               = new FormControlType(controlMetaData.controlId, parent);

    Object.assign(control, controlMetaData.properties);

    this.formStateManager.addForm(control.controlPath, control);

    return control;
  }

  public buildControls(
    controls: FormControlMetaData<any>[],
    parent: ParentForm<any>
  ): KeyValue<BaseFormControl<any>> {
    return controls.map(control => ({ [control.propertyKey]: this.buildControl(control, parent) })).reduce(objectReducer, {});
  }

}
