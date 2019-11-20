import {
  Directive,
  Input,
  forwardRef
} from '@angular/core';
import { StandaloneInputControlDirective } from '@rxap/form-system';
import {
  DateRangeFormControl,
  IDateRangeFormControl,
  DateRangeWeekDays,
  DateRangeFormControlOrientation
} from './date-range.form-control';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DisabledDate } from 'lightpick';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector:  'rxap-date-range-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneDateRangeControlDirective),
      multi:       true
    }
  ]
})
export class StandaloneDateRangeControlDirective
  extends StandaloneInputControlDirective<number, DateRangeFormControl>
  implements IDateRangeFormControl {

  @Input() public autoclose!: boolean;
  @Input() public disableDates!: ReadonlyArray<DisabledDate> | null;
  @Input() public disableWeekends!: boolean;
  @Input() public disabledDatesInRange!: boolean;
  @Input() public dropdowns!: any | boolean;
  @Input() public firstDay!: DateRangeWeekDays;
  @Input() public footer!: boolean | string;
  @Input() public format!: string;
  @Input() public hideOnBodyClick!: boolean;
  @Input() public hoveringTooltip!: boolean;
  @Input() public inline!: boolean;
  @Input() public lang!: string;
  @Input() public locale!: any;
  @Input() public maxDays!: number | null;
  @Input() public minDays!: number | null;
  @Input() public numberOfColumns!: number;
  @Input() public numberOfMonths!: number;
  @Input() public orientation!: DateRangeFormControlOrientation;
  @Input() public repick!: boolean;
  @Input() public selectBackward!: boolean;
  @Input() public selectForward!: boolean;
  @Input() public separator!: string;
  @Input() public singleDate!: boolean;
  @Input() public tooltipNights!: boolean;

  public buildControl(): DateRangeFormControl {
    return this.control = DateRangeFormControl.STANDALONE({
      injector:             this.injector,
      placeholder:          this.placeholder,
      label:                this.label,
      disabled:             this.disabled,
      readonly:             this.readonly,
      required:             this.required,
      name:                 this.name,
      initial:              this.initial,
      appearance:           this.appearance,
      prefixIcon:           this.prefixIcon,
      suffixIcon:           this.suffixIcon,
      prefixButton:         this.prefixButton,
      suffixButton:         this.suffixButton,
      type:                 this.type,
      min:                  this.min,
      max:                  this.max,
      pattern:              this.pattern,
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
      disableDates:         this.disableDates as any,
      selectForward:        this.selectForward,
      selectBackward:       this.selectBackward,
      minDays:              this.minDays,
      maxDays:              this.maxDays,
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

  public registerOnTouched(fn: any): void {
    console.warn('register on touched is currently not supported by any NgModelControlComponent');
  }

  public setDisabledState(isDisabled: boolean): void {
    throw new Error('Set disabled state of InputControl via NgModel is currently not supported');
  }

  public registerOnChange(fn: (value: any) => any): void {
    this.subscriptions.add(
      combineLatest(
        this.controlComponent.control.valueChange$,
        this.controlComponent.control.slaveControl.valueChange$
      ).pipe(
        tap(([ start, end ]) => fn({ start, end }))
      ).subscribe()
    );
  }

  public writeValue(obj: any): void {
    if (obj === null) {
      this.controlComponent.control.setValue(null);
      this.controlComponent.control.slaveControl.setValue(null);
    } else {
      this.controlComponent.control.setValue(obj.start || null);
      this.controlComponent.control.slaveControl.setValue(obj.end || null);
    }
  }

}
