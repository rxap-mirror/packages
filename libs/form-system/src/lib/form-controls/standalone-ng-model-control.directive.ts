import { ControlValueAccessor } from '@angular/forms';
import { NgModelControlComponent } from './ng-model-control.component';
import { Directive } from '@angular/core';
import { StandaloneControlDirective } from './standalone-control.directive';
import { BaseFormControl } from '../forms/form-controls/base.form-control';

@Directive({
  selector: '[rxapStandaloneNgModelControl]'
})
export class StandaloneNgModelControlDirective<ControlValue, FormControl extends BaseFormControl<ControlValue>>
  extends StandaloneControlDirective<ControlValue, FormControl, NgModelControlComponent<ControlValue, FormControl>>
  implements ControlValueAccessor {

  public registerOnChange(fn: (value: ControlValue) => any): void {
    this.controlComponent.registerOnModelChange(fn);
  }

  public registerOnTouched(fn: any): void {
    console.warn('register on touched is currently not supported by any NgModelControlComponent');
  }

  public setDisabledState(isDisabled: boolean): void {
    throw new Error('Set disabled state of InputControl via NgModel is currently not supported');
  }

  public writeValue(obj: ControlValue): void {
    this.controlComponent.model = obj;
  }

}
