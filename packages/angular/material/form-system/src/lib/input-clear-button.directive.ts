import {
  Directive,
  HostBinding,
  HostListener,
  Inject,
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField,
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

  public get control() {
    return this.formField._control;
  }

  @HostBinding('disabled')
  public get isDisabled() {
    return this.control.disabled;
  }

  @HostListener('click')
  public onClick() {
    if (this.control.ngControl) {
      this.control.ngControl.reset();
    } else {
      this.control.value = null;
    }
  }


}


