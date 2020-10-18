import {
  Directive,
  NgModule,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[rxapStopPropagation]'
})
export class StopPropagationDirective {

  @HostListener('click', [ '$event' ])
  public onClick($event: Event): void {
    $event.stopPropagation();
  }

}

@NgModule({
  exports:      [ StopPropagationDirective ],
  declarations: [ StopPropagationDirective ]
})
export class StopPropagationDirectiveModule {}
