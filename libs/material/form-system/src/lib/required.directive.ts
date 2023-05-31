import {
  Directive,
  Inject,
  AfterContentInit
} from '@angular/core';
import {
  MAT_LEGACY_FORM_FIELD as MAT_FORM_FIELD,
  MatLegacyFormField as MatFormField
} from '@angular/material/legacy-form-field';

@Directive({
  selector:   '[formControlName][rxapRequired]',
  standalone: true
})
export class RequiredDirective implements AfterContentInit {

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField
  ) {}

  public ngAfterContentInit() {
    const control = this.formField._control.ngControl?.control;
    if (control) {
      const hasRequiredValidator = Reflect.get(control, 'hasRequiredValidator');
      if (hasRequiredValidator) {
        (this.formField._control as any).required = true;
      }
    } else {
      throw new Error('The form field has not a control associated!');
    }
  }

}


