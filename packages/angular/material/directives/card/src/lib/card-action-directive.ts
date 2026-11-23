import { Directive } from '@angular/core';
import { Showcase } from '@ng-prism/core';

@Showcase<CardActionDirective>({
  title: 'Card Action',
  category: 'Material Directives',
  description: 'Positions the host element in the top right corner of a card.',
  status: 'stable',
  host: {
    template: '<mat-card style="position: relative; width: 280px"><mat-card-content>Card content with an action in the top right corner.</mat-card-content><button mat-icon-button rxapCardAction type="button"><mat-icon>more_vert</mat-icon></button></mat-card>',
  },
  imports: [
    { name: 'MatCard', from: '@angular/material/card' },
    { name: 'MatCardContent', from: '@angular/material/card' },
    { name: 'MatIconButton', from: '@angular/material/button' },
    { name: 'MatIcon', from: '@angular/material/icon' },
  ],
  variants: [{ name: 'Default' }],
})
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
