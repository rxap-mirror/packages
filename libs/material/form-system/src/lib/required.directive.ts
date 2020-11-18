import {
  Directive,
  Inject,
  NgModule,
  OnInit
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField
} from '@angular/material/form-field';

@Directive({
  selector: '[formControlName][rxapRequired]'
})
export class RequiredDirective implements OnInit {

  constructor(
    @Inject(MAT_FORM_FIELD)
    private readonly formField: MatFormField
  ) {}

  public ngOnInit() {
    const control = this.formField._control.ngControl?.control;
    if (control) {
      const hasRequiredValidator = Reflect.get(control, 'hasRequiredValidator');
      if (hasRequiredValidator) {
        (this.formField._control as any).required = true;
      }
    } else {
      throw new Error('Could not extract the control');
    }
  }

}

@NgModule({
  exports:      [ RequiredDirective ],
  declarations: [ RequiredDirective ]
})
export class RequiredDirectiveModule {}
