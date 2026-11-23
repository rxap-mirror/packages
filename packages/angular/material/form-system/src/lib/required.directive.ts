import { AfterContentInit, Directive, inject } from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField,
} from '@angular/material/form-field';
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<RequiredDirective>({
  title: 'Required',
  category: 'Material Form System',
  description: 'Marks the form field as required if the control of the input has a required validator.',
  status: 'stable',
  imports: [
    { name: 'ReactiveFormsModule', from: '@angular/forms' },
    { name: 'FormDirective', from: '@rxap/forms' },
    { name: 'MatFormFieldModule', from: '@angular/material/form-field' },
    { name: 'MatInputModule', from: '@angular/material/input' },
  ],
  variants: [
    {
      name: 'Required control',
      description: 'The control has a required validator, so the form field shows the required marker.',
      host: { template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" rxapRequired /></mat-form-field></form>` },
    },
    {
      name: 'With error message',
      description: 'Clear the field and leave it to show the error message rendered by the control error directive.',
      host: { template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><mat-form-field><mat-label>Email</mat-label><input matInput formControlName="email" rxapRequired /><mat-error *rxapControlError="let error; key: 'required'">The email is required</mat-error></mat-form-field></form>` },
    },
  ],
})
@Directive({
  selector: '[formControlName][rxapRequired],[formControl][rxapRequired]',
  standalone: true,
})
export class RequiredDirective implements AfterContentInit {
  private readonly formField = inject<MatFormField>(MAT_FORM_FIELD);


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


