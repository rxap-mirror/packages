import { Directive, inject } from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<InputClearButtonDirective>({
  title: 'Input Clear Button',
  category: 'Material Form System',
  description: 'A button that resets the value of the control of the form field to null.',
  status: 'stable',
  imports: [
    { name: 'ReactiveFormsModule', from: '@angular/forms' },
    { name: 'FormDirective', from: '@rxap/forms' },
    { name: 'MatFormFieldModule', from: '@angular/material/form-field' },
    { name: 'MatInputModule', from: '@angular/material/input' },
    { name: 'MatButtonModule', from: '@angular/material/button' },
  ],
  host: {
    template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><mat-form-field><mat-label>Name</mat-label><input matInput formControlName="name" /><button matSuffix mat-icon-button rxapInputClearButton aria-label="Clear">&times;</button></mat-form-field></form>`,
  },
  variants: [
    { name: 'Default' },
  ],
})
@Directive({
  selector: '[rxapInputClearButton]',
  standalone: true,
  host: {
    '[attr.type]': 'type',
    '[attr.tabindex]': 'tabIndex',
    '[disabled]': 'isDisabled',
    '(click)': 'onClick()',
  },
})
export class InputClearButtonDirective {
  private formField = inject<MatFormField>(MAT_FORM_FIELD);


  public type = 'button';

  public tabIndex = '-1';

  public get control(): MatFormFieldControl<any> {
    return this.formField._control;
  }

  public get isDisabled() {
    return this.control.disabled;
  }

  public onClick() {
    if (this.control.ngControl) {
      if (this.control.ngControl.control) {
        this.control.ngControl.control.setValue(null);
      } else {
        this.control.ngControl.reset();
      }
    } else {
      console.log('InputClearButtonDirective.onClick', 'value = null');
      this.control.value = null;
    }
  }


}


