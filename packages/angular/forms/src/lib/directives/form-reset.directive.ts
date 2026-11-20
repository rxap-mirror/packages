import { Directive, HostBinding, input, inject } from '@angular/core';
import { ConfirmClick } from '@rxap/directives';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormReset]',
  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
  },
  standalone: true,
})
export class FormResetDirective extends ConfirmClick {
  private readonly formDirective = inject<FormDirective>(FormDirective);


  @HostBinding('type')
public readonly type = input('button');

  protected execute() {
    this.formDirective.reset();
  }

}
