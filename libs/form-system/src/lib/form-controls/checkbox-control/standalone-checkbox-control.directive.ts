import {
  Directive,
  forwardRef,
  Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneNgModelControlDirective } from '../standalone-ng-model-control.directive';
import {
  CheckboxFormControl,
  ICheckboxFormControl,
  CheckboxLabelPosition
} from '../../forms/form-controls/checkbox.form-control';

@Directive({
  selector:  'rxap-checkbox-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneCheckboxControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneCheckboxControlDirective<ControlValue>
  extends StandaloneNgModelControlDirective<ControlValue,
    CheckboxFormControl<ControlValue>> implements ICheckboxFormControl<ControlValue> {

  @Input() public indeterminate!: boolean;
  @Input() public labelPosition!: CheckboxLabelPosition;

  public buildControl(): CheckboxFormControl<ControlValue> {
    return this.control = CheckboxFormControl.STANDALONE<ControlValue>({
      placeholder:   this.placeholder,
      label:         this.label,
      disabled:      this.disabled,
      readonly:      this.readonly,
      required:      this.required,
      name:          this.name,
      initial:       this.initial,
      indeterminate: this.indeterminate,
      labelPosition: this.labelPosition
    });
  }

}
