import { Directive, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Directive({
  selector: '[rxapFormControlMarkTouched]',
  host: { '(click)': 'onClick()' },
  standalone: true,
})
export class FormControlMarkTouchedDirective {
  private readonly parent = inject(ControlContainer);

  public onClick() {
    this.parent.control?.markAllAsTouched();
  }

}
