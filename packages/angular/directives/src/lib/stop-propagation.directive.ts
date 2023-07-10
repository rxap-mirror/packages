import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[rxapStopPropagation]',
  standalone: true,
})
export class StopPropagationDirective {

  @HostListener('click', ['$event'])
  public onClick($event: Event): void {
    $event.stopPropagation();
  }

}


