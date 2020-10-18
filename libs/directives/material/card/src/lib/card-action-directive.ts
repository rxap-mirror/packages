import {
  HostBinding,
  Directive,
  NgModule
} from '@angular/core';

@Directive({ selector: '[rxapCardAction]' })
export class CardActionDirective {

  @HostBinding('style.position')
  public position = 'absolute';

  @HostBinding('style.top')
  public top = '8px';

  @HostBinding('style.right')
  public right = '8px';

}

@NgModule({
  declarations: [ CardActionDirective ],
  exports:      [ CardActionDirective ]
})
export class CardActionModule {}


