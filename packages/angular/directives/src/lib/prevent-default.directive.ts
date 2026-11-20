import { Directive } from '@angular/core';

@Directive({
  selector: '[rxapPreventDefault]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class PreventDefaultDirective {
  public onClick($event: Event): void {
    $event.preventDefault();
  }
}
