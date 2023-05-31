import {
  HostBinding,
  Directive
} from '@angular/core';

@Directive({
  selector:   '[rxapCardAction]',
  standalone: true
})
export class CardActionDirective {

  @HostBinding('style.position')
  public position = 'absolute';

  @HostBinding('style.top')
  public top = '8px';

  @HostBinding('style.right')
  public right = '8px';

}




