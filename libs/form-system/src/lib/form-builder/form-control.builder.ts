import {
  Injectable,
  Injector
} from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { FormControlMetaData } from '../form-definition/decorators/control';
import { objectReducer } from '@rxap/utilities';
import { FormStateManager } from '../form-state-manager';
import { BaseForm } from '../forms/base.form';

@Injectable({ providedIn: 'root' })
export class FormControlBuilder {

  constructor(
    public readonly formStateManager: FormStateManager,
  ) {}

  public buildControl(controlMetaData: FormControlMetaData<any>, parent: BaseForm<any> | null = null): BaseFormControl<any> {
    const control: BaseFormControl<any> = new controlMetaData.formControl();

    control.controlId = controlMetaData.controlId;
    control.parent = parent;
    Object.assign(control, controlMetaData.options);
    control.placeholder = `FORMS.${control.controlPath}.PLACEHOLDER`;
    control.label = `FORMS.${control.controlPath}.LABEL`;

    this.formStateManager.addForm(control.controlPath, control);

    return control;
  }

  public buildControls(controls: FormControlMetaData<any>[], parent: BaseForm<any> | null = null): { [propertyKey: string]: BaseFormControl<any> } {
    return controls.map(control => ({ [control.propertyKey]: this.buildControl(control, parent) })).reduce(objectReducer, {});
  }

}
