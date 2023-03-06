import {
  Validator,
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {
  Directive,
  forwardRef
} from '@angular/core';

@Directive({
  selector: '[rxapIsSelectableValue]',
  providers: [
    {
      provide:     NG_VALIDATORS,
      multi:       true,
      useExisting: forwardRef(() => IsSelectableValueDirective)
    }
  ]
})
export class IsSelectableValueDirective implements Validator {

  public validate(control: AbstractControl): ValidationErrors | null {

  }

}
