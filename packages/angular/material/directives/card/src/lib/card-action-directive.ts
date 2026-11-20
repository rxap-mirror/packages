import { Directive } from '@angular/core';

@Directive({
  selector: '[rxapCardAction]',
  standalone: true,
  host: {
    '[style.position]': '"absolute"',
    '[style.top]': '"8px"',
    '[style.right]': '"8px"',
  },
})
export class CardActionDirective {
}
