import { NgClass } from '@angular/common';
import { afterNextRender, booleanAttribute, ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, linkedSignal, OnDestroy, signal } from '@angular/core';
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
import { Showcase } from '@ng-prism/core';

@Showcase<TableSelectInputComponent>({
  title: 'Table Select Input',
  category: 'Table Select',
  description: 'Form field control that shows the display value of the selected table row. The selection is made in a table select window.',
  status: 'stable',
  imports: [{ name: 'MatFormFieldModule', from: '@angular/material/form-field' }],
  host: { template: '<mat-form-field><mat-label>User</mat-label><rxap-table-select-input></rxap-table-select-input></mat-form-field>' },
  variants: [
    { name: 'Default' },
    { name: 'Placeholder', inputs: { placeholderInput: 'Select a user' } },
    { name: 'Required', inputs: { requiredInput: true, placeholderInput: 'Select a user' } },
    { name: 'Disabled', inputs: { disabledInput: true, placeholderInput: 'Select a user' } },
  ],
})
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
    host: {
        '[id]': 'id',
        '[class.floating]': 'shouldLabelFloat',
    },
    imports: [NgClass]
})
export class TableSelectInputComponent<Data extends Record<string, any> = Record<string, any>>
  extends ControlValueAccessor<Data>
  implements MatFormFieldControl<Data>, OnDestroy {
  ngControl = inject(NgControl, { optional: true, self: true });

  static nextId = 0;

  id = `rxap-table-select-input-${ TableSelectInputComponent.nextId++ }`;

  stateChanges = new Subject<void>();

  control: AbstractControl | null = null;
  rxapControl: RxapFormControl | null = null;

  focused = false;

  get empty() {
    return this._value() === null;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  public readonly requiredInput = input(false, { alias: 'required', transform: booleanAttribute });

  get required() {
    return this.requiredInput();
  }

  public readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  private readonly _disabled = linkedSignal(() => this.disabledInput());

  get disabled(): boolean { return this._disabled(); }

  private _subscription = new Subscription();

  get errorState(): boolean {
    return this.ngControl?.invalid || false;
  }

  private readonly _value = signal<Data | null>(null);

  public readonly placeholderInput = input('', { alias: 'placeholder' });

  get placeholder() {
    return this.placeholderInput();
  }

  set value(value: Data | null) {
    this._value.set(value);
  }

  get value(): Data | null {
    return this._value();
  }

  constructor() {
    super();
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
    effect(() => {
      this.requiredInput();
      this._disabled();
      this.placeholderInput();
      this._value();
      this.stateChanges.next();
    });
    afterNextRender(() => this.initControl());
  }

  private readonly _display = signal<string | undefined>(undefined);

  get display(): string | undefined {
    return this._display();
  }

  set display(value: string | undefined) {
    this._display.set(value);
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

  private initControl() {
    if (this.ngControl) {
      this.control = this.ngControl.control;
      if (this.control instanceof RxapFormControl) {
        this.rxapControl = this.control;
      }
    }
    this._subscription.add(this.control?.valueChanges.pipe(
      startWith(this.control?.value ?? null),
      delay(100), // TODO : remove timing workaround
      // the toDisplay function of this component is replaced by the TableSelectControlDirective
      // after the form field was initialized. The delay ensures the the this.toDisplay function
      // is called after that replacement else for the first value the default implementation is used
      tap(async value => this.display = value === null ? '' : await this.toDisplay(value)),
    ).subscribe());
    this._subscription.add(this.rxapControl?.disabled$.pipe(
      tap(disabled => this._disabled.set(disabled)),
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
