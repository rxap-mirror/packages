import {
  Directive,
  HostListener,
} from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Directive({
  selector: '[rxapFormControlMarkTouched]',
  standalone: true,
})
export class FormControlMarkTouchedDirective {

  constructor(private readonly parent: ControlContainer) {
  }

  @HostListener('click')
  public onClick() {
    this.parent.control?.markAllAsTouched();
  }

}
