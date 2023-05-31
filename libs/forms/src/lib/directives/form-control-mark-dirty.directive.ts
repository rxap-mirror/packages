import {
  Directive,
  HostListener
} from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';

@Directive({
  selector:   '[rxapFormControlMarkDirty]',
  standalone: true
})
export class FormControlMarkDirtyDirective {

  constructor(private readonly parent: ControlContainer) { }

  @HostListener('click')
  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control[ 'markAllAsDirty' ] === 'function') {
      control.markAllAsDirty();
    } else {
      control?.markAsDirty();
    }

  }

}
