import { Directive, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector: '[rxapFormControlMarkPristine]',
  host: { '(click)': 'onClick()' },
  standalone: true,
})
export class FormControlMarkPristineDirective {
  private readonly parent = inject(ControlContainer);

  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control['markAllAsPristine'] === 'function') {
      control['markAllAsPristine']();
    } else {
      control?.markAsPristine();
    }
  }

}
