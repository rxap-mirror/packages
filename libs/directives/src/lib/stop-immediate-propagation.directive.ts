import {
  Directive,
  NgModule,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[rxapStopImmediatePropagation]'
})
export class StopImmediatePropagationDirective {

  @HostListener('click', [ '$event' ])
  public onClick($event: Event): void {
    $event.stopImmediatePropagation();
  }

}

@NgModule({
  exports:      [ StopImmediatePropagationDirective ],
  declarations: [ StopImmediatePropagationDirective ]
})
export class StopImmediatePropagationDirectiveModule {}
