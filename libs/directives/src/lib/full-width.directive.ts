import {
  Directive,
  HostBinding,
  NgModule
} from '@angular/core';

@Directive({
  selector: '[rxapFullWidth]',
})
export class FullWidthDirective {

  @HostBinding('style.width')
  public width: string = '100%';

}

@NgModule({
  declarations: [FullWidthDirective],
  exports: [FullWidthDirective]
})
export class FullWidthDirectiveModule {}
