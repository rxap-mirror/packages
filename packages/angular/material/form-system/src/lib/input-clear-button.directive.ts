import {
  Directive,
  HostBinding,
  HostListener,
  Inject,
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';

@Directive({
  selector: '[rxapInputClearButton]',
  standalone: true,
})
export class InputClearButtonDirective {

  @HostBinding('attr.type')
  public type = 'button';

  @HostBinding('attr.tabindex')
  public tabIndex = '-1';

  constructor(
    @Inject(MAT_FORM_FIELD)
    private formField: MatFormField,
  ) {
  }

  public get control(): MatFormFieldControl<any> {
    return this.formField._control;
  }

  @HostBinding('disabled')
  public get isDisabled() {
    return this.control.disabled;
  }

  @HostListener('click')
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


