import {
  Directive,
  forwardRef,
  Input,
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Required } from '@rxap/utilities';

@Directive({
  selector: '[rxapIsEqualTo]',
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => IsEqualToDirective),
    },
  ],
  standalone: true,
})
export class IsEqualToDirective implements Validator {

  @Input('rxapIsEqualTo')
  @Required
  public set equalTo(value: any) {
    this._equalTo = value;
    if (this._onChange) {
      this._onChange();
    }
  }

  private _onChange!: () => void;


  private _equalTo!: any;

  public validate(control: AbstractControl): ValidationErrors | null {
    if (this._equalTo === null || this._equalTo === control.value) {
      return null;
    }
    return {isEqualTo: {value: this._equalTo, actualValue: control.value}};
  }

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  public registerOnValidatorChange(fn: () => void): void {
    this._onChange = fn;
  }

}


