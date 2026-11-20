import { Directive, HostListener, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector: '[rxapFormControlMarkUntouched]',
  standalone: true,
})
export class FormControlMarkUntouchedDirective {
  private readonly parent = inject(ControlContainer);


  @HostListener('click')
  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control['markAllAsUntouched'] === 'function') {
      control['markAllAsUntouched']();
    } else {
      control?.markAsUntouched();
    }
  }

}
