import {
  Directive,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[rxapStopImmediatePropagation]',
  standalone: true,
})
export class StopImmediatePropagationDirective {

  @HostListener('click', ['$event'])
  public onClick($event: Event): void {
    $event.stopImmediatePropagation();
  }

}


