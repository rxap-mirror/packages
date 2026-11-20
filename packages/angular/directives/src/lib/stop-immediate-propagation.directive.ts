import { Directive } from '@angular/core';

@Directive({
  selector: '[rxapStopImmediatePropagation]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class StopImmediatePropagationDirective {
  public onClick($event: Event): void {
    $event.stopImmediatePropagation();
  }
}
