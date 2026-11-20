import { Directive, HostListener, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Directive({
  selector: '[rxapFormControlMarkTouched]',
  standalone: true,
})
export class FormControlMarkTouchedDirective {
  private readonly parent = inject(ControlContainer);


  @HostListener('click')
  public onClick() {
    this.parent.control?.markAllAsTouched();
  }

}
