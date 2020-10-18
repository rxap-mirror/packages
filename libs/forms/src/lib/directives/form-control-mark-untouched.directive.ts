import {
  Directive,
  HostListener
} from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector: '[rxapFormControlMarkUntouched]'
})
export class FormControlMarkUntouchedDirective {

  constructor(private readonly parent: ControlContainer) { }

  @HostListener('click')
  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control[ 'markAllAsUntouched' ] === 'function') {
      control.markAllAsUntouched();
    } else {
      control?.markAsUntouched();
    }
  }

}
