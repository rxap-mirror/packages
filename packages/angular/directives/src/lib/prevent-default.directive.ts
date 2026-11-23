import { Directive } from '@angular/core';
import { Showcase } from '@ng-prism/core';

@Showcase<PreventDefaultDirective>({
  title: 'Prevent Default',
  category: 'Directives',
  description: 'Calls `preventDefault()` on every click event of the host element, e.g. to stop a link from navigating.',
  status: 'stable',
  host: '<a href="https://example.com">Link that does not navigate</a>',
  variants: [{ name: 'Default' }],
})
@Directive({
  selector: '[rxapPreventDefault]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class PreventDefaultDirective {
  public onClick($event: Event): void {
    $event.preventDefault();
  }
}
