import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  NgClass,
  NgIf,
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import {
  AbstractControl,
  NgControl,
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import {
  ControlValueAccessor,
  RxapFormControl,
} from '@rxap/forms';
import {
  delay,
  startWith,
  Subject,
  Subscription,
} from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'rxap-table-select-input',
    templateUrl: './table-select-input.component.html',
    styleUrls: ['./table-select-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: MatFormFieldControl,
            useExisting: forwardRef(() => TableSelectInputComponent),
        },
    ],
    imports: [NgClass, NgIf]
})
export class TableSelectInputComponent<Data extends Record<string, any> = Record<string, any>>
  extends ControlValueAccessor<Data>
  implements MatFormFieldControl<Data>, OnDestroy, AfterViewInit {

  static nextId = 0;

  @HostBinding() id = `rxap-table-select-input-${ TableSelectInputComponent.nextId++ }`;

  stateChanges = new Subject<void>();

  control: AbstractControl | null = null;
  rxapControl: RxapFormControl | null = null;

  focused = false;

  get empty() {
    return this._value === null;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean { return this._disabled; }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  private _subscription = new Subscription();

  get errorState(): boolean {
    return this.ngControl?.invalid || false;
  }


  private _disabled = false;

  private _required = false;

  private _value: Data | null = null;

  private _placeholder = '';

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  set value(value: Data | null) {
    this._value = value;
    this.stateChanges.next();
  }

  get value(): Data | null {
    return this._value;
  }

  constructor(
    @Optional() @Self() public ngControl: NgControl | null,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  private _display?: string;

  get display(): string | undefined {
    return this._display;
  }

  set display(value: string | undefined) {
    this._display = value;
    this.cdr.detectChanges();
  }

  public writeValue(value: Data) {
    this.value = value;
  }

  public setValue(value: Data) {
    this.value = value;
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  ngAfterViewInit() {
    if (this.ngControl) {
      this.control = this.ngControl.control;
      if (this.control instanceof RxapFormControl) {
        this.rxapControl = this.control;
      }
    }
    this._subscription.add(this.control?.valueChanges.pipe(
      startWith(this.control?.value ?? null),
      delay(100), // TODO : remove timing workaround
      // the method updateTableSelectInput of TableSelectControlDirective is called in the ngAfterViewInit
      // and will be executed AFTER the first value is used to create the display
      // solution: it must be ensured the the this.toDisplay function is called after the updateTableSelectInput
      // execution else for the first this.toDisplay function the default implementation is used
      tap(async value => this.display = value === null ? '' : await this.toDisplay(value)),
    ).subscribe());
    this._subscription.add(this.rxapControl?.disabled$.pipe(
      tap(disabled => this.disabled = disabled),
    ).subscribe());
  }

  toDisplay(value: any): string | Promise<string> {
    return value;
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._subscription?.unsubscribe();
  }

  setDescribedByIds(ids: string[]): void {
    // no op
  }

  onContainerClick(event: MouseEvent): void {
    // no op
  }

}
