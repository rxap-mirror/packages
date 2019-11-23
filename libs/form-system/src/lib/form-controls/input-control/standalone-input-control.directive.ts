import {
  Directive,
  forwardRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneNgModelControlDirective } from '../standalone-ng-model-control.directive';
import {
  InputFormControl,
  IInputFormControl,
  InputTypes
} from '../../forms/form-controls/input.form-control';
import { AppearanceTypes } from '../../forms/form-controls/form-field.form-control';
import { IconConfig } from '@rxap/utilities';
import { tap } from 'rxjs/operators';

@Directive({
  selector:  'rxap-input-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneInputControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneInputControlDirective<ControlValue, FormControl extends InputFormControl<ControlValue> = InputFormControl<ControlValue>>
  extends StandaloneNgModelControlDirective<ControlValue, FormControl> implements IInputFormControl<ControlValue> {

  // TODO move to StandaloneFormFieldFormControlDirective
  @Input() public appearance!: AppearanceTypes;
  @Input() public prefixButton: string | IconConfig | null = null;
  @Input() public prefixIcon: string | IconConfig | null   = null;
  @Input() public suffixButton: string | IconConfig | null = null;
  @Input() public suffixIcon: string | IconConfig | null   = null;
  @Input() public max: number | null                       = null;
  @Input() public min: number | null                       = null;
  @Input() public pattern!: RegExp | null;
  @Input() public type!: InputTypes;

  @Output() public clickPrefixButton = new EventEmitter();
  @Output() public clickSuffixButton = new EventEmitter();

  public buildControl(): FormControl {
    const control: InputFormControl<ControlValue> = InputFormControl.STANDALONE<ControlValue>({
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

    this.subscriptions.add(
      control.prefixButtonClick$.pipe(
        tap(() => this.clickPrefixButton.emit())
      ).subscribe()
    );

    this.subscriptions.add(
      control.suffixButtonClick$.pipe(
        tap(() => this.clickSuffixButton.emit())
      ).subscribe()
    );

    return control as any;
  }

}
