import {
  Directive,
  forwardRef,
  Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneNgModelControlDirective } from '../standalone-ng-model-control.directive';
import { AppearanceTypes } from '../../forms/form-controls/form-field.form-control';
import {
  IconConfig,
  ControlOptions
} from '@rxap/utilities';
import {
  SelectFormControl,
  ISelectFormControl,
  OptionsDataSourceToken
} from '../../forms/form-controls/select.form-control';

@Directive({
  selector:  'rxap-select-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneSelectControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneSelectControlDirective<ControlValue>
  extends StandaloneNgModelControlDirective<ControlValue,
    SelectFormControl<ControlValue>> implements ISelectFormControl<ControlValue> {

  // TODO move to StandaloneFormFieldFormControlDirective
  @Input() public appearance!: AppearanceTypes;
  @Input() public prefixButton: string | IconConfig | null                       = null;
  @Input() public prefixIcon: string | IconConfig | null                         = null;
  @Input() public suffixButton: string | IconConfig | null                       = null;
  @Input() public suffixIcon: string | IconConfig | null                         = null;
  @Input() public multiple                                                       = false;
  @Input() public options!: ControlOptions<ControlValue>;
  @Input() public optionsDataSource: OptionsDataSourceToken<ControlValue> | null = null;

  public buildControl(): SelectFormControl<ControlValue> {
    this.control = SelectFormControl.STANDALONE<ControlValue>({
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
      multiple:     this.multiple,
      options:      this.options
    });
    this.control.handelOptionsDataSource(this.optionsDataSource);
    return this.control;
  }

}
