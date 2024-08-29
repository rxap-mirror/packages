import {
  Directive,
  HostBinding,
  Inject,
  Input,
} from '@angular/core';
import { ConfirmClick } from '@rxap/directives';
import { FormDirective } from './form.directive';

@Directive({
  selector: '[rxapFormReset]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
  },
  standalone: true,
})
export class FormResetDirective extends ConfirmClick {

  @HostBinding('type')
  @Input()
  public type = 'button';

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
  ) {
    super();
  }

  protected execute() {
    this.formDirective.reset();
  }

}
