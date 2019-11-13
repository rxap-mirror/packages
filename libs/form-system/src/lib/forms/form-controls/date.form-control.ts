import { InputFormControl } from './input.form-control';
import {
  ThemePalette,
  Type,
  CssClass
} from '@rxap/utilities';
import {
  MatCalendarCellCssClasses,
  DateAdapter,
  NativeDateAdapter,
  MAT_DATE_LOCALE
} from '@angular/material';
import { Subject } from 'rxjs';
import {
  format,
  getDate,
  parse
} from 'date-fns';
import {
  Inject,
  Optional,
  StaticProvider
} from '@angular/core';
import { Platform } from '@angular/cdk/platform';

export enum DateFormControlStartViews {
  MONTH      = 'month',
  YEAR       = 'year',
  MULTI_YEAR = 'multi-year',
}

export class RxapDateAdapter extends DateAdapter<number> {

  public nativeDateAdapter: NativeDateAdapter;

  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string, platform: Platform) {
    super();
    this.nativeDateAdapter = new NativeDateAdapter(matDateLocale, platform);
  }

  /**
   * Adds the given number of days to the date. Days are counted as if moving one cell on the
   * calendar for each day.
   * @param date The date to add days to.
   * @param days The number of days to add (may be negative).
   * @returns A new date equal to the given one with the specified number of days added.
   */
  public addCalendarDays(date: number, days: number): number {
    return this.nativeDateAdapter.addCalendarDays(new Date(date), days).getTime();
  }

  /**
   * Adds the given number of months to the date. Months are counted as if flipping a page on the
   * calendar for each month and then finding the closest date in the new month. For example when
   * adding 1 month to Jan 31, 2017, the resulting date will be Feb 28, 2017.
   * @param date The date to add months to.
   * @param months The number of months to add (may be negative).
   * @returns A new date equal to the given one with the specified number of months added.
   */
  public addCalendarMonths(date: number, months: number): number {
    return this.nativeDateAdapter.addCalendarMonths(new Date(date), months).getTime();
  }

  /**
   * Adds the given number of years to the date. Years are counted as if flipping 12 pages on the
   * calendar for each year and then finding the closest date in the new month. For example when
   * adding 1 year to Feb 29, 2016, the resulting date will be Feb 28, 2017.
   * @param date The date to add years to.
   * @param years The number of years to add (may be negative).
   * @returns A new date equal to the given one with the specified number of years added.
   */
  public addCalendarYears(date: number, years: number): number {
    return this.nativeDateAdapter.addCalendarYears(new Date(date), years).getTime();
  }

  /**
   * Clones the given date.
   * @param date The date to clone
   * @returns A new date equal to the given date.
   */
  public clone(date: number): number {
    return Number(date);
  }

  /**
   * Creates a date with the given year, month, and date. Does not allow over/under-flow of the
   * month and date.
   * @param year The full year of the date. (e.g. 89 means the year 89, not the year 1989).
   * @param month The month of the date (0-indexed, 0 = January). Must be an integer 0 - 11.
   * @param date The date of month of the date. Must be an integer 1 - length of the given month.
   * @returns The new date, or null if invalid.
   */
  public createDate(year: number, month: number, date: number): number {
    return new Date(year, month, date).getTime();
  }

  /**
   * Formats a date as a string according to the given format.
   * @param date The value to format.
   * @param displayFormat The format to use to display the date as a string.
   * @returns The formatted date string.
   */
  public format(date: number, displayFormat: any): string {
    if (!this.isValid(date)) {
      throw Error('RxapDateAdapter: Cannot format invalid date.');
    }
    return format(date, displayFormat);
  }

  /**
   * Gets the date of the month component of the given date.
   * @param date The date to extract the date of the month from.
   * @returns The month component (1-indexed, 1 = first of month).
   */
  public getDate(date: number): number {
    return getDate(date);
  }

  /**
   * Gets a list of names for the dates of the month.
   * @returns An ordered list of all date of the month names, starting with '1'.
   */
  public getDateNames(): string[] {
    return this.nativeDateAdapter.getDateNames();
  }

  /**
   * Gets the day of the week component of the given date.
   * @param date The date to extract the day of the week from.
   * @returns The month component (0-indexed, 0 = Sunday).
   */
  public getDayOfWeek(date: number): number {
    return this.nativeDateAdapter.getDayOfWeek(new Date(date));
  }

  /**
   * Gets a list of names for the days of the week.
   * @param style The naming style (e.g. long = 'Sunday', short = 'Sun', narrow = 'S').
   * @returns An ordered list of all weekday names, starting with Sunday.
   */
  public getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    return this.nativeDateAdapter.getDayOfWeekNames(style);
  }

  /**
   * Gets the first day of the week.
   * @returns The first day of the week (0-indexed, 0 = Sunday).
   */
  public getFirstDayOfWeek(): number {
    return this.nativeDateAdapter.getFirstDayOfWeek();
  }

  /**
   * Gets the month component of the given date.
   * @param date The date to extract the month from.
   * @returns The month component (0-indexed, 0 = January).
   */
  public getMonth(date: number): number {
    return this.nativeDateAdapter.getMonth(new Date(date));
  }

  /**
   * Gets a list of names for the months.
   * @param style The naming style (e.g. long = 'January', short = 'Jan', narrow = 'J').
   * @returns An ordered list of all month names, starting with January.
   */
  public getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return this.nativeDateAdapter.getMonthNames(style);
  }

  /**
   * Gets the number of days in the month of the given date.
   * @param date The date whose month should be checked.
   * @returns The number of days in the month of the given date.
   */
  public getNumDaysInMonth(date: number): number {
    return this.nativeDateAdapter.getNumDaysInMonth(new Date(date));
  }

  /**
   * Gets the year component of the given date.
   * @param date The date to extract the year from.
   * @returns The year component.
   */
  public getYear(date: number): number {
    return this.nativeDateAdapter.getYear(new Date(date));
  }

  /**
   * Gets the name for the year of the given date.
   * @param date The date to get the year name for.
   * @returns The name of the given year (e.g. '2017').
   */
  public getYearName(date: number): string {
    return this.nativeDateAdapter.getYearName(new Date(date));
  }

  /**
   * Gets date instance that is not valid.
   * @returns An invalid date.
   */
  public invalid(): number {
    return NaN;
  }

  /**
   * Checks whether the given object is considered a date instance by this DateAdapter.
   * @param obj The object to check
   * @returns Whether the object is a date instance.
   */
  public isDateInstance(obj: any): boolean {
    return typeof obj === 'number';
  }

  /**
   * Checks whether the given date is valid.
   * @param date The date to check.
   * @returns Whether the date is valid.
   */
  public isValid(date: number): boolean {
    return !isNaN(date) && date > 0;
  }

  /**
   * Parses a date from a user-provided value.
   * @param value The value to parse.
   * @param parseFormat The expected format of the value being parsed
   *     (type is implementation-dependent).
   * @returns The parsed date.
   */
  public parse(value: any, parseFormat: any): number | null {
    return parse(value, parseFormat).getTime();
  }

  /**
   * Gets the RFC 3339 compatible string (https://tools.ietf.org/html/rfc3339) for the given date.
   * This method is used to generate date strings that are compatible with native HTML attributes
   * such as the `min` or `max` attribute of an `<input>`.
   * @param date The date to get the ISO date string for.
   * @returns The ISO date string date string.
   */
  public toIso8601(date: number): string {
    return this.nativeDateAdapter.toIso8601(new Date(date));
  }

  /**
   * Gets today's date.
   * @returns Today's date.
   */
  public today(): number {
    return this.nativeDateAdapter.today().getTime();
  }

}

export const RXAP_DATE_ADAPTER_PROVIDER: StaticProvider = {
  provide:  DateAdapter,
  useClass: RxapDateAdapter,
  deps:     [ MAT_DATE_LOCALE, Platform ]
};

export class DateFormControl
  extends InputFormControl<number> {

  /**
   * An input indicating the type of the custom header component for the
   * calendar, if set.
   */
  public calendarHeaderComponent!: Type<any>;

  /**
   * Color palette to use on the datepicker's calendar.
   */
  public color!: ThemePalette;

  /**
   * Function that can be used to add custom CSS classes to dates.
   */
  public dateClass?: (date: number) => MatCalendarCellCssClasses;

  /**
   * Whether the calendar is open.
   */
  public opened = false;

  /**
   * Classes to be passed to the date picker panel. Supports the same syntax as
   * ngClass.
   */
  public panelClass?: CssClass;

  /**
   * The date to open the calendar to initially.
   * default is the BaseFormControl.initial value
   */
  public startAt: number | null = null;

  /**
   * The view that the calendar should start in.
   */
  public startView: DateFormControlStartViews = DateFormControlStartViews.MONTH;

  /**
   * Whether the calendar UI is in touch mode. In touch mode the calendar opens
   * in a dialog rather than a popup and elements have more padding to allow
   * for bigger touch targets.
   */
  public touchUi = false;

  /**
   * Emits when the datepicker has been closed.
   */
  public closedStream$ = new Subject<void>();

  /**
   * Emits selected month in year view. This doesn't imply a change on the
   * selected date.
   */
  public monthSelected$ = new Subject<number>();

  /**
   * Emits when the datepicker has been opened.
   */
  public openedStream$ = new Subject<void>();

  /**
   * Emits selected year in multiyear view. This doesn't imply a change on the
   * selected date.
   */
  public yearSelected$ = new Subject<number>();

  /**
   * Function that can be used to filter out dates within the datepicker.
   */
  public datepickerFilter?: (date: number) => boolean;

  public providers: StaticProvider[] = [ RXAP_DATE_ADAPTER_PROVIDER ];

}
