import {
  Directive,
  HostBinding,
  Inject,
  input
} from '@angular/core';
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

  @HostBinding('type')
public readonly type = input('button');

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
  ) {
    super();
  }

  protected execute() {
    this.formDirective.reset();
  }

}
