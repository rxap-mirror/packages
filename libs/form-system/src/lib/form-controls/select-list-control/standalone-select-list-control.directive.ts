import {
  Directive,
  forwardRef,
  Input
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneNgModelControlDirective } from '../standalone-ng-model-control.directive';
import {
  CheckboxPosition,
  SelectListFormControl,
  ISelectListFormControl
} from '../../forms/form-controls/select-list.form-control';
import { AppearanceTypes } from '../../forms/form-controls/form-field.form-control';
import {
  IconConfig,
  ControlOptions
} from '@rxap/utilities';
import { OptionsDataSourceToken } from '../../forms/form-controls/select.form-control';

@Directive({
  selector:  'rxap-select-list-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneSelectListControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneSelectListControlDirective<ControlValue>
  extends StandaloneNgModelControlDirective<ControlValue,
    SelectListFormControl<ControlValue>> implements ISelectListFormControl<ControlValue> {

  @Input() public checkboxPosition!: CheckboxPosition;
  @Input() public appearance!: AppearanceTypes;
  @Input() public prefixButton: string | IconConfig | null                       = null;
  @Input() public prefixIcon: string | IconConfig | null                         = null;
  @Input() public suffixButton: string | IconConfig | null                       = null;
  @Input() public suffixIcon: string | IconConfig | null                         = null;
  public multiple                                                                = false;
  @Input() public options!: ControlOptions<ControlValue>;
  @Input() public optionsDataSource: OptionsDataSourceToken<ControlValue> | null = null;

  public buildControl(): SelectListFormControl<ControlValue> {
    return SelectListFormControl.STANDALONE<ControlValue>({
      injector:         this.injector,
      placeholder:      this.placeholder,
      label:            this.label,
      disabled:         this.disabled,
      readonly:         this.readonly,
      required:         this.required,
      name:             this.name,
      initial:          this.initial,
      appearance:       this.appearance,
      prefixIcon:       this.prefixIcon,
      suffixIcon:       this.suffixIcon,
      prefixButton:     this.prefixButton,
      suffixButton:     this.suffixButton,
      multiple:         this.multiple,
      options:          this.options,
      checkboxPosition: this.checkboxPosition
    });
  }

}
