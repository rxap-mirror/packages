import {
  InputFormControl,
  BaseFormControl,
  FormStateManager,
  BaseFormGroup,
  IInputFormControl
} from '@rxap/form-system';
import { Subject } from 'rxjs';
import { Required } from '@rxap/utilities';
import { BaseForm } from '../../../../form-system/src/lib/forms/base.form';
import { DisabledDate } from 'lightpick';

export enum DateRangeWeekDays {
  Monday    = 1,
  Tuesday   = 2,
  Wednesday = 3,
  Thursday  = 4,
  Friday    = 5,
  Saturday  = 6,
  Sunday    = 7
}

export type DateRangeFormControlOrientation =
  | 'auto'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

export interface IDateRangeFormControl<ControlValue = number> extends IInputFormControl<ControlValue> {
  firstDay: DateRangeWeekDays;
  lang: string;
  format: string;
  separator: string;
  numberOfMonths: number;
  numberOfColumns: number;
  singleDate: boolean;
  autoclose: boolean;
  hideOnBodyClick: boolean;
  repick: boolean;
  disableDates: ReadonlyArray<DisabledDate>;
  selectForward: boolean;
  selectBackward: boolean;
  minDays: number | null;
  maxDays: number | null;
  hoveringTooltip: boolean;
  footer: boolean | string;
  disabledDatesInRange: boolean;
  tooltipNights: boolean;
  orientation: DateRangeFormControlOrientation;
  disableWeekends: boolean;
  inline: boolean;
  // TODO add typing from https://wakirin.github.io/Lightpick/#configuration
  dropdowns: any | boolean;
  // TODO add typing from https://wakirin.github.io/Lightpick/#configuration
  locale: any;
}

export class DateRangeFormControl<ControlValue = number>
  extends InputFormControl<ControlValue> {

  public static EMPTY(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): DateRangeFormControl<any> {
    return new DateRangeFormControl<any>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue = number>(options: Partial<IDateRangeFormControl<ControlValue>> = {}): DateRangeFormControl<ControlValue> {
    const control       = DateRangeFormControl.EMPTY();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, options);
    return control;
  }

  /**
   * The control path to the control that represents the end date
   */
  @Required public slaveControlPath!: string;

  /**
   * The control instance that represents the end date
   */
  @Required public slaveControl!: BaseFormControl<ControlValue>;

  /**
   * ISO day of the week (1: Monday, ..., 7: Sunday).
   * @default 1
   */
  public firstDay: DateRangeWeekDays = DateRangeWeekDays.Monday;

  /**
   * Language code for names of days, months by Date.prototype.toLocaleString().
   * 'auto' will try detect user browser language.
   * @default auto
   */
  public lang = 'auto';

  /**
   * The default output format.
   * @default DD.MM.YYYY
   */
  public format = 'DD.MM.YYYY';

  /**
   * Separator between dates when one field.
   * @default -
   */
  public separator = '-';

  /**
   * Number of visible months.
   * @default 1
   */
  public numberOfMonths = 1;

  /**
   * Number of columns months.
   * @default 2
   */
  public numberOfColumns = 2;

  /**
   * Choose a single date instead of a date range.
   * @default true
   */
  public singleDate = true;

  /**
   * Close calendar when picked date/range.
   * @default true
   */
  public autoclose = true;

  /**
   * Close calendar when clicked outside the elements specified in field or
   * parentEl. Recommended use when autoclose is set to false.
   * @default true
   */
  public hideOnBodyClick = true;

  /**
   * Repick start/end instead of new range. This option working only when
   * exists `secondField`.
   * @default false
   */
  public repick = false;

  /**
   * Array of disabled dates. Array can contains ranges, allowed the same
   * format as in options minDate, maxDate.
   * Ex.: [moment().startOf('month'), ['2018-06-23', '2018-06-30']]
   * @default null
   */
  public disableDates?: ReadonlyArray<DisabledDate>;

  /**
   * Select second date after the first selected date.
   * @default false
   */
  public selectForward = false;

  /**
   * Select second date before the first selected date.
   * @default false
   */
  public selectBackward = false;

  /**
   * The minimum days of the selected range.
   * @default null
   */
  public minDays: number | null = null;

  /**
   * The maximum days of the selected range.
   * @default null
   */
  public maxDays: number | null = null;

  /**
   * Show tooltip.
   * @default true
   */
  public hoveringTooltip = true;

  /**
   * Footer calendar, if set to `true` will use default footer
   * (Reset/Apply buttons) or custom string (html).
   * @default false
   */
  public footer: boolean | string = false;

  /**
   * If set to `false` then will reset selected range when disabled dates
   * exists in selected range.
   * @default true
   */
  public disabledDatesInRange = true;

  /**
   * Calc date range in nights.
   * @default false
   */
  public tooltipNights = false;

  /**
   * A space-separated string consisting of one or two of “left” or “right”,
   * “top” or “bottom”, and “auto” (may be omitted); for example, “top left”,
   * “bottom” (horizontal orientation will default to “auto”), “right”
   * (vertical orientation will default to “auto”), “auto top”.
   * @default auto
   */
  public orientation: DateRangeFormControlOrientation = 'auto';

  /**
   * Disable Saturday and Sunday.
   * @default false
   */
  public disableWeekends = false;

  /**
   * Show calendar inline. If true and parentEl is not provided then will
   * use parentNode of field.
   * @default false
   */
  public inline = false;

  /**
   * Dropdown selections for years, months. Can be false for disable both dropdowns.
   *
   * years (Object|Boolean) - Object must contains min and max range of years or can be false for disable dropdown of years.
   * months (Boolean) - true/false for enable/disable dropdown of months.
   */
  public dropdowns: any | boolean = {
    years:  {
      min: 1900,
      max: null
    },
    months: true
  };

  /**
   * buttons - Text for buttons
   * tooltip - Text for tooltip (one, few, many, other)
   * tooltipOnDisabled (String) - Show tooltip text on disabled dates. (Eg. «Already booked»)
   * pluralize (function) - Function for calc plural text. More examples for another locales on betsol/numerous
   */
  public locale: any = {
    buttons:           {
      prev:  '←',
      next:  '→',
      close: '×',
      reset: 'Reset',
      apply: 'Apply'
    },
    tooltip:           {
      one:   'day',
      other: 'days'
    },
    tooltipOnDisabled: null,
    pluralize:         function(i: any, locale: any) {
      if (typeof i === 'string') {
        i = parseInt(i, 10);
      }

      if (i === 1 && 'one' in locale) {
        return locale.one;
      }
      if ('other' in locale) {
        return locale.other;
      }

      return '';
    }
  };

  /**
   * Callback function for when a date is selected.
   */
  public select$ = new Subject();

  /**
   * Callback function for when the picker becomes visible.
   */
  public open$ = new Subject();

  /**
   * Callback function for when the picker is hidden.
   */
  public close$ = new Subject();

  public init() {
    super.init();
    this.slaveControl         = this.getSlaveControl();
    this.slaveControl.initial = this.initial;
    this.slaveControl.init();
  }

  public rxapOnDestroy(): void {
    super.rxapOnDestroy();
    this.slaveControl.rxapOnDestroy();
  }

  public rxapOnInit(): void {
    super.rxapOnInit();
    this.slaveControl.rxapOnInit();
  }

  private getSlaveControl(): BaseFormControl<ControlValue> {
    const slaveControlPath = this.controlPath.split('.');
    slaveControlPath.pop();
    slaveControlPath.push(...this.slaveControlPath.split('.'));
    const formStateManager = this.injector.get(FormStateManager);
    return formStateManager.getForm(slaveControlPath.join('.'));
  }

}
