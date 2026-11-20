import {
  Directive,
  effect,
  forwardRef,
  input,
  untracked,
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

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

  public readonly equalTo = input.required<any>({ alias: 'rxapIsEqualTo' });

  private _onChange?: () => void;

  constructor() {
    effect(() => {
      this.equalTo();
      untracked(() => this._onChange?.());
    });
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    const equalTo = this.equalTo();
    if (equalTo === null || equalTo === control.value) {
      return null;
    }
    return {
      isEqualTo: {
        value: equalTo,
        actualValue: control.value,
      },
    };
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


