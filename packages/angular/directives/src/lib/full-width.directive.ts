import { Directive } from '@angular/core';
import { Showcase } from '@ng-prism/core';

@Showcase<FullWidthDirective>({
  title: 'Full Width',
  category: 'Directives',
  description: 'Sets `width: 100%` on the host element.',
  status: 'stable',
  canvasLayout: 'stretch',
  host: '<button type="button">Button with full width</button>',
  variants: [{ name: 'Default' }],
})
@Directive({
  selector: '[rxapFullWidth]',
  standalone: true,
  host: {
    style: 'width: 100%',
  },
})
export class FullWidthDirective {}
