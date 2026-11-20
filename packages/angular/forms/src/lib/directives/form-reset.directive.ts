import { Directive, inject, input } from '@angular/core';
import { ConfirmClick } from '@rxap/directives';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormReset]',
  host: {
    '[type]': 'type()',
  },
  standalone: true,
})
export class FormResetDirective extends ConfirmClick {
  private readonly formDirective = inject<FormDirective>(FormDirective);

  public readonly type = input('button');

  protected execute() {
    this.formDirective.reset();
  }

}
