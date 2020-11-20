import {
  Directive,
  Inject,
  NgModule,
  AfterContentInit
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';

@Directive({
  selector: '[formControlName][rxapRequired]'
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

@NgModule({
  exports:      [ RequiredDirective ],
  declarations: [ RequiredDirective ]
})
export class RequiredDirectiveModule {}
