import { Directive, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector: '[rxapFormControlMarkUntouched]',
  host: { '(click)': 'onClick()' },
  standalone: true,
})
export class FormControlMarkUntouchedDirective {
  private readonly parent = inject(ControlContainer);

  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control['markAllAsUntouched'] === 'function') {
      control['markAllAsUntouched']();
    } else {
      control?.markAsUntouched();
    }
  }

}
