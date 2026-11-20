import { Directive } from '@angular/core';

@Directive({
  selector: '[rxapStopPropagation]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class StopPropagationDirective {
  public onClick($event: Event): void {
    $event.stopPropagation();
  }
}
