import {
  Injectable,
  StaticProvider,
} from '@angular/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { Subject } from 'rxjs';

declare let $localize: any;

@Injectable()
export class I18nMatDatepickerIntl implements MatDatepickerIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  readonly changes: Subject<void> = new Subject<void>();

  /** A label for the calendar popup (used by screen readers). */
  calendarLabel: string = $localize`:@@calendarLabelMatDatepicker:Calendar`;

  /** A label for the button used to open the calendar popup (used by screen readers). */
  openCalendarLabel: string = $localize`:@@openCalendarLabelMatDatepicker:Open calendar`;

  /** Label for the button used to close the calendar popup. */
  closeCalendarLabel: string = $localize`:@@closeCalendarLabelMatDatepicker:Close calendar`;

  /** A label for the previous month button (used by screen readers). */
  prevMonthLabel: string = $localize`:@@prevMonthLabelMatDatepicker:Previous month`;

  /** A label for the next month button (used by screen readers). */
  nextMonthLabel: string = $localize`:@@nextMonthLabelMatDatepicker:Next month`;

  /** A label for the previous year button (used by screen readers). */
  prevYearLabel: string = $localize`:@@prevYearLabelMatDatepicker:Previous year`;

  /** A label for the next year button (used by screen readers). */
  nextYearLabel: string = $localize`:@@nextYearLabelMatDatepicker:Next year`;

  /** A label for the previous multi-year button (used by screen readers). */
  prevMultiYearLabel: string = $localize`:@@prevMultiYearLabelMatDatepicker:Previous 24 years`;

  /** A label for the next multi-year button (used by screen readers). */
  nextMultiYearLabel: string = $localize`:@@nextMultiYearLabelMatDatepicker:Next 24 years`;

  /** A label for the 'switch to month view' button (used by screen readers). */
  switchToMonthViewLabel: string = $localize`:@@switchToMonthViewLabelMatDatepicker:Choose date`;

  /** A label for the 'switch to year view' button (used by screen readers). */
  switchToMultiYearViewLabel: string = $localize`:@@switchToMultiYearViewLabelMatDatepicker:Choose month and year`;

  /**
   * A label for the first date of a range of dates (used by screen readers).
   * @deprecated Provide your own internationalization string.
   * @breaking-change 17.0.0
   */
  startDateLabel: string = $localize`:@@startDateLabelMatDatepicker:Start date`;

  /**
   * A label for the last date of a range of dates (used by screen readers).
   * @deprecated Provide your own internationalization string.
   * @breaking-change 17.0.0
   */
  endDateLabel: string = $localize`:@@endDateLabelMatDatepicker:End date`;

  /** Formats a range of years (used for visuals). */
  formatYearRange(start: string, end: string): string {
    return $localize`:@@formatYearRangeMatDatepicker:${ start } \u2013 ${ end }`;
  }

  /** Formats a label for a range of years (used by screen readers). */
  formatYearRangeLabel(start: string, end: string): string {
    return $localize`:@@formatYearRangeLabelMatDatepicker:${ start } to ${ end }`;
  }
}

export const I18N_MAT_DATEPICKER_INTL_PROVIDER: StaticProvider = {
  provide: MatDatepickerIntl,
  useClass: I18nMatDatepickerIntl,
};

export function ProvideI18nMatDatepickerIntl() {
  return I18N_MAT_DATEPICKER_INTL_PROVIDER;
}
