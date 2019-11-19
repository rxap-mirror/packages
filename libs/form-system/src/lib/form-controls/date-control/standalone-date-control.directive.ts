import {
  Directive,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneInputControlDirective } from '../input-control/standalone-input-control.directive';
import { DateFormControl } from '../../forms/form-controls/date.form-control';

@Directive({
  selector:  'rxap-date-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneDateControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneDateControlDirective<ControlValue, FormControl extends DateFormControl<ControlValue> = DateFormControl<ControlValue>>
  extends StandaloneInputControlDirective<ControlValue, FormControl> {

  public buildControl(): FormControl {
    return this.control = DateFormControl.STANDALONE<ControlValue>({
      injector:     this.injector,
      placeholder:  this.placeholder,
      label:        this.label,
      disabled:     this.disabled,
      readonly:     this.readonly,
      required:     this.required,
      name:         this.name,
      initial:      this.initial,
      appearance:   this.appearance,
      prefixIcon:   this.prefixIcon,
      suffixIcon:   this.suffixIcon,
      prefixButton: this.prefixButton,
      suffixButton: this.suffixButton,
      type:         this.type,
      min:          this.min,
      max:          this.max,
      pattern:      this.pattern
    }) as any;
  }

}
