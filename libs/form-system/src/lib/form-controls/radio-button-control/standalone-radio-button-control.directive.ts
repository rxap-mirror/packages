import {
  Directive,
  forwardRef,
  Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneNgModelControlDirective } from '../standalone-ng-model-control.directive';
import {
  IRadioButtonFormControl,
  LabelPositions,
  RadioButtonFormControl
} from '../../forms/form-controls/radio-button.form-control';
import { ThemePalette } from '@angular/material';
import { ControlOptions } from '@rxap/utilities';

@Directive({
  selector:  'rxap-radio-button-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneRadioButtonControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneRadioButtonControlDirective<ControlValue>
  extends StandaloneNgModelControlDirective<ControlValue,
    RadioButtonFormControl<ControlValue>> implements IRadioButtonFormControl<ControlValue> {

  @Input() public color!: ThemePalette;
  @Input() public labelPosition!: LabelPositions;
  @Input() public options!: ControlOptions<ControlValue>;

  public buildControl(): RadioButtonFormControl<ControlValue> {
    return RadioButtonFormControl.STANDALONE<ControlValue>({
      injector:      this.injector,
      placeholder:   this.placeholder,
      label:         this.label,
      disabled:      this.disabled,
      readonly:      this.readonly,
      required:      this.required,
      name:          this.name,
      initial:       this.initial,
      color:         this.color,
      labelPosition: this.labelPosition,
      options:       this.options
    });
  }

}
