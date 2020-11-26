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

  constructor(
    @Inject(MAT_FORM_FIELD)
    private formField: MatFormField
  ) {}

  @HostListener('click')
  public onClick() {
    if (this.formField._control.ngControl) {
      this.formField._control.ngControl.reset();
    } else {
      this.formField._control.value = null;
    }
  }


}

@NgModule({
  declarations: [ InputClearButtonDirective ],
  exports:      [ InputClearButtonDirective ]
})
export class InputClearButtonDirectiveModule {}
