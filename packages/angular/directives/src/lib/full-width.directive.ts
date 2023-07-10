import {Directive, HostBinding} from '@angular/core';

@Directive({
  selector: '[rxapFullWidth]',
  standalone: true,
})
export class FullWidthDirective {

  @HostBinding('style.width')
  public width = '100%';

}


