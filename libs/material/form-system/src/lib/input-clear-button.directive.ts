import {
  NgModule,
  Directive,
  Input,
  Inject,
  HostListener
} from '@angular/core';
import {
  MatFormField,
  MAT_FORM_FIELD
} from '@angular/material/form-field';

@Directive({
  selector: '[rxapInputClearButton]'
})
export class InputClearButtonDirective {

  constructor(
    @Inject(MAT_FORM_FIELD)
    private formField: MatFormField
  ) {}

  @HostListener('click')
  public onClick() {
    this.formField._control.ngControl?.reset();
  }


}

@NgModule({
  declarations: [ InputClearButtonDirective ],
  exports:      [ InputClearButtonDirective ]
})
export class InputClearButtonDirectiveModule {}
