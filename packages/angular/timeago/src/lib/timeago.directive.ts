import {
  Directive,
  ElementRef,
  inject,
  Input,
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
  @Input()
  set date(date: string | number | Date) {
    this.setContent(this.elementRef.nativeElement, TimeagoFormatter(date));
  }

  private _live = true;

  /** If the directive should update itself over time */
  @Input()
  set live(live: boolean) {
    this._live = coerceBoolean(live);
  }

  setContent(node: any, content: string) {
    if (IsDefinedAndNotNull(node.textContent)) {
      node.textContent = content;
    } else {
      node.data = content;
    }
  }

}
