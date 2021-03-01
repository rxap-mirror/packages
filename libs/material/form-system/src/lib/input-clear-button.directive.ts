import {
  NgModule,
  Directive,
  Inject,
  HostListener,
  HostBinding
} from '@angular/core';
import {
  MatFormField,
  MAT_FORM_FIELD
} from '@angular/material/form-field';

@Directive({
  selector: '[rxapInputClearButton]'
})
export class InputClearButtonDirective {

  @HostBinding('attr.type')
  public type = 'button';

  @HostBinding('attr.tabindex')
  public tabIndex = '-1';

  public get control() {
    return this.formField._control;
  }

  @HostBinding('disabled')
  public get isDisabled() {
    return this.control.disabled;
  }

  constructor(
    @Inject(MAT_FORM_FIELD)
    private formField: MatFormField
  ) {}

  @HostListener('click')
  public onClick() {
    if (this.control.ngControl) {
      this.control.ngControl.reset();
    } else {
      this.control.value = null;
    }
  }


}

@NgModule({
  declarations: [ InputClearButtonDirective ],
  exports:      [ InputClearButtonDirective ]
})
export class InputClearButtonDirectiveModule {}
