import { BaseControlComponent } from './base-control.component';
import { Injectable } from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';

@Injectable()
export class NgModelControlComponent<ControlValue, FormControl extends BaseFormControl<ControlValue>>
  extends BaseControlComponent<ControlValue, FormControl> {

  public get model(): ControlValue | null {
    return this.control.value;
  }

  public set model(value: ControlValue | null) {
    this.control.setValue(value);
  }

}
