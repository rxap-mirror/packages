import { Directive, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector: '[rxapFormControlMarkDirty]',
  host: { '(click)': 'onClick()' },
  standalone: true,
})
export class FormControlMarkDirtyDirective {
  private readonly parent = inject(ControlContainer);

  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control['markAllAsDirty'] === 'function') {
      control['markAllAsDirty']();
    } else {
      control?.markAsDirty();
    }

  }

}
