import {
  Directive,
  forwardRef,
  Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneNgModelControlDirective } from '../standalone-ng-model-control.directive';
import { IconConfig } from '@rxap/utilities';
import {
  TextareaFormControl,
  ITextareaFormControl
} from '../../forms/form-controls/textarea-form.control';
import { AppearanceTypes } from '../../forms/form-controls/form-field.form-control';

@Directive({
  selector:  'rxap-textarea-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneTextareaControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneTextareaControlDirective<ControlValue>
  extends StandaloneNgModelControlDirective<ControlValue,
    TextareaFormControl<ControlValue>> implements ITextareaFormControl<ControlValue> {
  @Input() public autosize                                 = true;
  @Input() public maxRows!: number;
  @Input() public minRows!: number;
  @Input() public appearance!: AppearanceTypes;
  @Input() public prefixButton: string | IconConfig | null = null;
  @Input() public prefixIcon: string | IconConfig | null   = null;
  @Input() public suffixButton: string | IconConfig | null = null;
  @Input() public suffixIcon: string | IconConfig | null   = null;

  public buildControl(): TextareaFormControl<ControlValue> {
    return TextareaFormControl.STANDALONE<ControlValue>({
      injector:     this.injector,
      placeholder:  this.placeholder,
      label:        this.label,
      disabled:     this.disabled,
      readonly:     this.readonly,
      required:     this.required,
      name:         this.name,
      initial:      this.initial,
      maxRows:      this.maxRows,
      minRows:      this.minRows,
      autosize:     this.autosize,
      appearance:   this.appearance,
      prefixIcon:   this.prefixIcon,
      suffixIcon:   this.suffixIcon,
      prefixButton: this.prefixButton,
      suffixButton: this.suffixButton
    });
  }

}
