import { Directive, inject } from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';

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


