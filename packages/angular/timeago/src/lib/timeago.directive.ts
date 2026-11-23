import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import {
  coerceBoolean,
  IsDefinedAndNotNull,
} from '@rxap/utilities';
import { TimeagoFormatter } from './timeago.formatter';
import { Showcase } from '@ng-prism/core';

@Showcase<TimeagoDirective>({
  title: 'Timeago',
  category: 'Directives',
  description: 'Replaces the text content of the host element with the human readable relative time of the given date, e.g. `3 years ago`.',
  status: 'stable',
  // `date` is a union type (string | number | Date) that ng-prism cannot bind from a variant input,
  // so every variant writes the date into its host template
  variants: [
    { name: 'Past date', host: { template: '<span rxapTimeago date="2024-01-15T00:00:00"></span>' } },
    { name: 'Future date', host: { template: '<span rxapTimeago date="2099-01-15T00:00:00"></span>' } },
    { name: 'Timestamp', host: { template: '<span rxapTimeago [date]="1700000000000"></span>' } },
    { name: 'Not live', host: { template: '<span rxapTimeago date="2024-01-15T00:00:00" [live]="false"></span>' } },
  ],
})
@Directive({
  selector: '[rxapTimeago]',
  exportAs: 'rxapTimeago',
  standalone: true,
})
export class TimeagoDirective {

  private readonly elementRef = inject(ElementRef);

  /** The Date to display. An actual Date object or something that can be fed to new Date. */
  readonly date = input.required<string | number | Date>();

  /** If the directive should update itself over time */
  readonly live = input(true, { transform: (live: boolean | '') => coerceBoolean(live) });

  constructor() {
    effect(() => {
      this.setContent(this.elementRef.nativeElement, TimeagoFormatter(this.date()));
    });
  }

  setContent(node: any, content: string) {
    if (IsDefinedAndNotNull(node.textContent)) {
      node.textContent = content;
    } else {
      node.data = content;
    }
  }

}
