import {
  afterNextRender,
  computed,
  Directive,
  effect,
  inject,
  INJECTOR,
  Injector,
  input,
  isDevMode,
  linkedSignal,
  OnDestroy,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import {
  BaseDataSource,
  DataSourceLoader,
} from '@rxap/data-source';
import { AbstractTableDataSource } from '@rxap/data-source/table';
import { RxapFormControl } from '@rxap/forms';
import { Mixin } from '@rxap/mixin';
import { GenerateRandomString } from '@rxap/utilities';
import { WindowService } from '@rxap/window-system';
import { Observable } from 'rxjs';
import { ExtractTableSelectColumnMapMixin } from './extract-table-select-column-map.mixin';
import { ExtractTableSelectDataSourceMixin } from './extract-table-select-data-source.mixin';
import { ExtractTableSelectToValueMixin } from './extract-table-select-to-value.mixin';
import {
  OpenTableSelectWindowMethod,
  TableSelectColumn,
} from './open-table-select-window.method';

export interface OpenTableSelectWindowDirective<Data extends Record<string, any>, Value = Data>
  extends ExtractTableSelectDataSourceMixin<Data>, ExtractTableSelectColumnMapMixin,
    ExtractTableSelectToValueMixin<Data, Value> {
}

@Mixin(ExtractTableSelectDataSourceMixin,
  ExtractTableSelectColumnMapMixin,
  ExtractTableSelectToValueMixin,
)
@Directive({
  selector: '[rxapOpenTableSelectWindow]',
  standalone: true,
  providers: [ OpenTableSelectWindowMethod ],
  host: {
    type: 'button',
    '[disabled]': 'disabled()',
    '(click)': 'onClick($event)',
  },
})
export class OpenTableSelectWindowDirective<Data extends Record<string, any> = Record<string, any>, Value = Data>
  implements OnDestroy {
  public readonly dataInput = input<Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data>>(undefined, { alias: 'data' });
  public readonly data = linkedSignal(() => this.dataInput());
  public readonly columnsInput = input<Map<string, TableSelectColumn> | Record<string, TableSelectColumn>>(undefined, { alias: 'columns' });
  public readonly columns = linkedSignal(() => this.columnsInput());
  public readonly selectedInput = input<Data[]>([], { alias: 'selected' });
  public readonly selected = linkedSignal(() => this.selectedInput());
  public readonly parameters = input<Observable<Record<string, unknown>>>();
  public readonly selectedChange = output<Data[]>();
  public readonly labelInput = input<string>(undefined, { alias: 'label' });
  public readonly label = linkedSignal(() => this.labelInput());
  public readonly id = input<string>();
  public _internalId                    = GenerateRandomString();
  public readonly compareWithInput = input<(o1: Data, o2: Data) => boolean>(undefined, { alias: 'compareWith' });
  public readonly compareWith = linkedSignal(() => this.compareWithInput());

  public readonly multiple              = input(false);

  public control?: RxapFormControl;
  // required for the use mixin ExtractDatasourceMixin
  public readonly dataSourceLoader      = inject(DataSourceLoader);
  protected _hasOpenWindow              = false;
  protected readonly openMethod         = inject<OpenTableSelectWindowMethod<Data>>(OpenTableSelectWindowMethod);
  protected readonly windowService      = inject(WindowService);
  protected readonly injector: Injector = inject(INJECTOR);
  protected matButton                   = inject(MatButton, {optional: true});

  private readonly _disabled = signal(false);

  private readonly invalidInputs = computed(() => !this.columns() || !this.data());

  public readonly disabled = computed(() => this._disabled() || this.invalidInputs());

  public readonly toValueInput = input<(value: Data) => Value | Promise<Value>>(undefined, { alias: 'toValue' });
  public readonly toValue = linkedSignal(() => this.toValueInput());

  constructor() {
    effect(() => {
      const data = this.data();
      const columns = this.columns();
      const disabled = this.disabled();
      untracked(() => this.checkInputs(data, columns, disabled));
    });
    afterNextRender(() => this.initFromFormField());
  }

  public setDisabled(value: boolean) {
    this._disabled.set(value);
  }

  ngOnDestroy() {
    if (this.windowService.has(this._internalId)) {
      this.windowService.close(this._internalId);
    }
  }

  public async onClick($event: Event) {
    $event.stopPropagation();
    if (this.disabled() || this._hasOpenWindow) {
      console.debug('disabled or has open window', {disabled: this.disabled(), hasOpenWindow: this._hasOpenWindow});
      return;
    }
    const data = this.data();
    const columns = this.columns();
    if (!data || !columns) {
      throw new Error('FATAL: The data or columns input is not set');
    }
    this._hasOpenWindow = true;
    this.control?.disable();
    let selected: Data[] | undefined;
    try {
      selected = await this.openMethod.call({
      windowConfig: {
        id: this._internalId,
      },
      injector: this.injector,
      data: data,
      columns: columns instanceof Map ? columns : new Map(Object.entries(columns)),
      selected: this.selected()?.slice() ?? [],
      title: this.label() ?? 'Select value',
      compareWith: this.compareWith(),
      id: this.id() ?? GenerateRandomString(10),
      parameters: this.parameters(),
      multiple: this.multiple(),
      });
    } finally {
      this._hasOpenWindow = false;
      this.control?.enable();
    }
    if (isDevMode()) {
      console.debug('selected', selected);
    }
    this.selected.set(selected ?? []);
    const selectedValue = this.selected();
    this.selectedChange.emit(selectedValue);
    if (selectedValue.length) {
      const toValue = this.toValue();
      if (toValue) {
        this.control?.setValue(toValue(selectedValue[0]));
      } else {
        throw new Error('The toValue method is not defined');
      }
    } else {
      this.control?.reset();
    }
  }

  private initFromFormField() {
    const hasNgControl    = !!this.injector.get(NgControl, null);
    const hasMatFormField = !!this.injector.get(MatFormField, null);
    if (hasMatFormField || hasNgControl) {
      this.matFormField = this.injector.get(MatFormField);
      this.ngControl    = this.matFormField._control.ngControl;
      this.control ??= this.ngControl?.control as RxapFormControl ?? null;
      if (!this.data()) {
        this.data.set(this.extractTableSelectDataSource());
      }
      if (!this.columns()) {
        this.columns.set(this.extractTableSelectColumnMap());
      }
      if (!this.toValue()) {
        this.toValue.set(this.extractTableSelectToValue() ?? (value => value as any));
      }
      if (this.control) {
        this.setDisabled(this.control.disabled);
        this.control.registerOnDisabledChange(isDisabled => {
          this.setDisabled(isDisabled);
        });
      }
    }
  }

  private checkInputs(
    data: Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data> | undefined,
    columns: Map<string, TableSelectColumn> | Record<string, TableSelectColumn> | undefined,
    disabled: boolean,
  ) {
    if (!columns || !data) {
      console.warn('columns or data is not defined');
    } else {
      if (typeof columns !== 'object') {
        throw new Error('Ensure that the input columns has a valid value');
      }
      if (!Array.isArray(data) && !(data instanceof BaseDataSource)) {
        throw new Error('Ensure that the input data has a valid value');
      }
    }
    if (this.matButton) {
      this.matButton.disabled = disabled;
    }
  }

}
