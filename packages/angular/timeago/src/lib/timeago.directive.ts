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
