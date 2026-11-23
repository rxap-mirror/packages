import { Directive, inject, input } from '@angular/core';
import { ConfirmClick } from '@rxap/directives';
import { FormDirective } from './form.directive';
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<FormResetDirective>({
  title: 'Form Reset',
  category: 'Forms',
  description: 'A button that resets the form to its initial state. Change a value, then press the button.',
  status: 'stable',
  imports: [ { name: 'ReactiveFormsModule', from: '@angular/forms' } ],
  host: {
    template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><label>Name <input formControlName="name" /></label><label>Email <input formControlName="email" type="email" /></label><div><button rxapFormReset>Reset</button></div></form>`,
  },
  variants: [
    { name: 'Default' },
  ],
})
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
