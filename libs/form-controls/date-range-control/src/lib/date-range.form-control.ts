import {
  InputFormControl,
  BaseFormControl,
  FormStateManager,
  BaseFormGroup,
  IInputFormControl,
  BaseForm,
  SetFormControlMeta,
  RxapControlProperty
} from '@rxap/form-system';
import {
  Subject,
  combineLatest
} from 'rxjs';
import {
  DeleteUndefinedProperties,
  RxapDetectChanges,
  RxapOnPropertyChange,
  PropertyChange
} from '@rxap/utilities';
import * as Lightpick from 'lightpick';
import {
  DisabledDate,
  OutputDate
} from 'lightpick';
import {
  tap,
  filter
} from 'rxjs/operators';
import { differenceInDays } from 'date-fns';
import { RXAP_DATE_RANGE_CONTROL } from './date-range-control.component';

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
  disableDates: ReadonlyArray<DisabledDate> | null;
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

export function RxapDateRangeControl(slaveControlPath: string) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', DateRangeFormControl)(target, propertyKey);
    RxapControlProperty('slaveControlPath', slaveControlPath)(target, propertyKey);
    RxapControlProperty('componentId', RXAP_DATE_RANGE_CONTROL)(target, propertyKey);
  };
}

export class DateRangeFormControl<ControlValue = number>
  extends InputFormControl<ControlValue>
  implements RxapOnPropertyChange {

  public static EMPTY(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): DateRangeFormControl<any> {
    return new DateRangeFormControl<any>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue = number>(options: Partial<IDateRangeFormControl<ControlValue>> = {}): DateRangeFormControl<ControlValue> {
    const control       = DateRangeFormControl.EMPTY();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, DeleteUndefinedProperties(options));
    return control;
  }

  /**
   * The control path to the control that represents the end date
   */
  public slaveControlPath!: string;

  /**
   * The control instance that represents the end date
   */
  public slaveControl!: BaseFormControl<ControlValue>;

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
  public separator = ' - ';

  /**
   * Number of visible months.
   * @default 1
   */
  @RxapDetectChanges public numberOfMonths = 1;

  /**
   * Number of columns months.
   * @default 2
   */
  @RxapDetectChanges public numberOfColumns = 2;

  /**
   * Choose a single date instead of a date range.
   * @default true
   */
  public singleDate = false;

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

  public picker!: Lightpick;

  public element!: Element & { value: string };

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
    this.initSalveControl();
  }

  public rxapOnDestroy(): void {
    super.rxapOnDestroy();
    this.slaveControl.rxapOnDestroy();
  }

  public rxapOnPropertyChange(change: PropertyChange<any>): void {
    switch (change.propertyKey) {

      case 'min':
        this.renderLightpick({
          minDate: change.currentValue && new Date(change.currentValue)
        });
        break;

      case 'max':
        this.renderLightpick({
          maxDate: change.currentValue && new Date(change.currentValue)
        });
        break;

      case 'numberOfMonths':
        this.renderLightpick({
          numberOfMonths: change.currentValue
        });
        break;

      case 'numberOfColumns':
        this.renderLightpick({
          numberOfColumns: change.currentValue
        });
        break;

    }
  }

  public getLightpickOptions(): Partial<Lightpick.Options> {
    return DeleteUndefinedProperties({
      firstDay:             this.firstDay,
      lang:                 this.lang,
      format:               this.format,
      separator:            this.separator,
      numberOfMonths:       this.numberOfMonths,
      numberOfColumns:      this.numberOfColumns,
      singleDate:           this.singleDate,
      autoclose:            this.autoclose,
      hideOnBodyClick:      this.hideOnBodyClick,
      repick:               this.repick,
      disableDates:         this.disableDates,
      selectForward:        this.selectForward,
      selectBackward:       this.selectBackward,
      minDate:              this.min && new Date(this.min),
      maxDate:              this.max && new Date(this.max),
      minDays:              this.minDays as any,
      maxDays:              this.maxDays as any,
      hoveringTooltip:      this.hoveringTooltip,
      footer:               this.footer,
      disabledDatesInRange: this.disabledDatesInRange,
      tooltipNights:        this.tooltipNights,
      orientation:          this.orientation,
      disableWeekends:      this.disableWeekends,
      inline:               this.inline,
      dropdowns:            this.dropdowns,
      locale:               this.locale
    });
  }

  public renderLightpick(options: Partial<Lightpick.Options> = {}) {
    if (this.picker) {
      this.picker.destroy();
    }
    this.picker = new Lightpick({
      field:    this.element,
      onSelect: this.onSelect.bind(this),
      ...this.getLightpickOptions(),
      ...options
    });
  }

  public reset() {
    super.reset();
    this.picker.reset();
  }

  public rxapOnInit(): void {
    super.rxapOnInit();
    this.slaveControl.rxapOnInit();
    this._subscriptions.add(
      combineLatest(
        this.valueChange$,
        this.slaveControl.valueChange$
      ).pipe(
        filter(([ start, end ]) => !!start && !!end),
        tap(([ start, end ]: [ any, any ]) => {
          const days           = differenceInDays(end, start);
          const numberOfMonths = Math.floor(days / 30) + 1;
          this.numberOfMonths  = numberOfMonths;
          this.numberOfColumns = Math.floor(numberOfMonths / 3) + 1;
        })
      ).subscribe()
    );
    this._subscriptions.add(
      this.valueChange$.pipe(
        filter(start => {
          const pickerStart = this.picker.getStartDate();
          if (pickerStart === null) {
            // if the picker has not a start value
            // but the control has a value return true
            return start !== pickerStart;
          }
          if (start === null) {
            // if the control has not a value
            // but the picker has a value return true
            return start !== pickerStart;
          }
          return pickerStart.toDate().getTime() !== Number(start);
        }),
        tap(start => this.picker.setStartDate(start))
      ).subscribe()
    );
    this._subscriptions.add(
      this.slaveControl.valueChange$.pipe(
        filter(end => {
          const pickerEnd = this.picker.getEndDate();
          if (pickerEnd === null) {
            // if the picker has not a end value
            // but the control has a value return true
            return end !== pickerEnd;
          }
          if (end === null) {
            // if the control has not a value
            // but the picker has a value return true
            return end !== pickerEnd;
          }
          return pickerEnd.toDate().getTime() !== Number(end);
        }),
        tap(start => this.picker.setEndDate(start))
      ).subscribe()
    );
  }

  public initLightpick(element: Element & { value: string }): void {
    this.element = element;
    this.renderLightpick();
  }

  private initSalveControl(): void {
    this.slaveControl         = this.getSlaveControl();
    this.slaveControl.initial = this.initial;
    this.slaveControl.init();
  }

  private getSlaveControl(): BaseFormControl<ControlValue> {
    if (this.slaveControlPath) {
      const slaveControlPath = this.controlPath.split('.');
      slaveControlPath.pop();
      slaveControlPath.push(...this.slaveControlPath.split('.'));
      const formStateManager = this.injector.get(FormStateManager);
      return formStateManager.getForm(slaveControlPath.join('.'));
    }
    return BaseFormControl.EMPTY(this.parent);
  }

  public onSelect(startDate: OutputDate, endDate: OutputDate) {
    if (startDate) {
      this.setValue(startDate.toDate().getTime() as any);
    }
    if (endDate) {
      this.slaveControl.setValue(endDate.toDate().getTime() as any);
    }
  }

}
