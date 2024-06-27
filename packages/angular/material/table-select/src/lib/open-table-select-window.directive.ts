import {
  AfterViewInit,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  INJECTOR,
  Injector,
  input,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
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
})
export class OpenTableSelectWindowDirective<Data extends Record<string, any> = Record<string, any>, Value = Data>
  implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @Input()
  public data?: Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data>;
  @Input()
  public columns?: Map<string, TableSelectColumn> | Record<string, TableSelectColumn>;
  @Input()
  public selected: Data[]               = [];
  @Input()
  public parameters?: Observable<Record<string, unknown>>;
  @Output()
  public selectedChange                 = new EventEmitter<Data[]>();
  @Input()
  public label?: string;
  @Input()
  public id?: string;
  public _internalId                    = GenerateRandomString();
  @Input()
  public compareWith?: (o1: Data, o2: Data) => boolean;

  public readonly multiple              = input(false);

  @HostBinding('type')
  public type                           = 'button';
  public control?: RxapFormControl;
  // required for the use mixin ExtractDatasourceMixin
  public readonly dataSourceLoader      = inject(DataSourceLoader);
  protected _hasOpenWindow              = false;
  protected readonly openMethod         = inject<OpenTableSelectWindowMethod<Data>>(OpenTableSelectWindowMethod);
  protected readonly windowService      = inject(WindowService);
  protected readonly injector: Injector = inject(INJECTOR);
  protected matButton                   = inject(MatButton, {optional: true});
  private invalidInputs                 = false;

  private _disabled = false;

  @HostBinding('disabled')
  get disabled(): boolean {
    return this._disabled || this.invalidInputs;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }

  @Input()
  public toValue?: (value: Data) => Value | Promise<Value>;

  public ngOnChanges() {
    this.checkInputs();
  }

  public ngOnInit() {
    this.checkInputs();
  }

  ngOnDestroy() {
    if (this.windowService.has(this._internalId)) {
      this.windowService.close(this._internalId);
    }
  }

  @HostListener('click', [ '$event' ])
  public async onClick($event: Event) {
    $event.stopPropagation();
    if (this.disabled || this._hasOpenWindow) {
      console.debug('disabled or has open window', {disabled: this.disabled, hasOpenWindow: this._hasOpenWindow});
      return;
    }
    if (!this.data || !this.columns) {
      throw new Error('FATAL: The data or columns input is not set');
    }
    setTimeout(() => {
      this.control?.disable();
    });
    const selected = await this.openMethod.call({
      windowConfig: {
        id: this._internalId,
      },
      injector: this.injector,
      data: this.data,
      columns: this.columns instanceof Map ? this.columns : new Map(Object.entries(this.columns)),
      selected: this.selected?.slice() ?? [],
      title: this.label ?? 'Select value',
      compareWith: this.compareWith,
      id: this.id ?? GenerateRandomString(10),
      parameters: this.parameters,
      multiple: this.multiple(),
    });
    this.control?.enable();
    if (isDevMode()) {
      console.debug('selected', selected);
    }
    this.selected       = selected ?? [];
    this._hasOpenWindow = false;
    this.selectedChange.emit(this.selected);
    if (this.selected.length) {
      if (this.toValue) {
        this.control?.setValue(this.toValue(this.selected[0]));
      } else {
        throw new Error('The toValue method is not defined');
      }
    } else {
      this.control?.reset();
    }
  }

  ngAfterViewInit() {
    const hasNgControl    = !!this.injector.get(NgControl, null);
    const hasMatFormField = !!this.injector.get(MatFormField, null);
    if (hasMatFormField || hasNgControl) {
      this.matFormField = this.injector.get(MatFormField);
      this.ngControl    = this.matFormField._control.ngControl;
      this.control ??= this.ngControl?.control as RxapFormControl ?? null;
      this.data ??= this.extractTableSelectDataSource();
      this.columns ??= this.extractTableSelectColumnMap();
      this.toValue ??= this.extractTableSelectToValue() ?? (value => value as any);
      if (this.control) {
        this.disabled = this.control.disabled;
        this.control.registerOnDisabledChange(isDisabled => {
          this.disabled = isDisabled;
        });
      }
    }
    this.checkInputs();
  }

  public checkInputs() {
    if (!this.columns || !this.data) {
      console.warn('columns or data is not defined');
      this.invalidInputs = true;
      if (this.matButton) {
        this.matButton.disabled = this.disabled;
      }
    } else {
      if (typeof this.columns !== 'object') {
        throw new Error('Ensure that the input columns has a valid value');
      }
      if (!Array.isArray(this.data) && !(this.data instanceof BaseDataSource)) {
        throw new Error('Ensure that the input data has a valid value');
      }
      this.invalidInputs = false;
      if (this.matButton) {
        this.matButton.disabled = this.disabled;
      }
    }
  }

}
