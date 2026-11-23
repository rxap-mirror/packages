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
import { Showcase } from '@ng-prism/core';

@Showcase<IsEqualToDirective>({
  title: 'Is Equal To',
  category: 'Form System',
  description: 'A validator that is invalid as long as the control value is not equal to the given value, e.g. for a password confirmation. The validation errors are printed below the input.',
  status: 'stable',
  imports: [
    { name: 'FormsModule', from: '@angular/forms' },
    { name: 'JsonPipe', from: '@angular/common' },
  ],
  variants: [
    {
      name: 'Equal',
      inputs: { equalTo: 'secret' },
      host: { template: '<div style="display: flex; flex-direction: column; gap: 4px"><input ngModel="secret" #model="ngModel" rxapIsEqualTo /><small>errors: {{ model.errors | json }}</small></div>' },
    },
    {
      name: 'Not equal',
      inputs: { equalTo: 'secret' },
      host: { template: '<div style="display: flex; flex-direction: column; gap: 4px"><input ngModel="other" #model="ngModel" rxapIsEqualTo /><small>errors: {{ model.errors | json }}</small></div>' },
    },
  ],
})
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


