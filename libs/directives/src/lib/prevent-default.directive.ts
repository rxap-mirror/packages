import {
  Directive,
  HostListener
} from '@angular/core';

@Directive({
  selector:   '[rxapPreventDefault]',
  standalone: true
})
export class PreventDefaultDirective {

  @HostListener('click', [ '$event' ])
  public onClick($event: Event): void {
    $event.preventDefault();
  }

}


