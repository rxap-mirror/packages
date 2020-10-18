import {
  Directive,
  NgModule,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[rxapPreventDefault]'
})
export class PreventDefaultDirective {

  @HostListener('click', [ '$event' ])
  public onClick($event: Event): void {
    $event.preventDefault();
  }

}

@NgModule({
  exports:      [ PreventDefaultDirective ],
  declarations: [ PreventDefaultDirective ]
})
export class PreventDefaultDirectiveModule {}
