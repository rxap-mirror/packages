import {
  Directive,
  HostListener,
} from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector: '[rxapFormControlMarkPristine]',
  standalone: true,
})
export class FormControlMarkPristineDirective {

  constructor(private readonly parent: ControlContainer) {
  }

  @HostListener('click')
  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control['markAllAsPristine'] === 'function') {
      control['markAllAsPristine']();
    } else {
      control?.markAsPristine();
    }
  }

}
