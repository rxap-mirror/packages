import {
  afterNextRender,
  Directive,
  effect,
  ElementRef,
  inject,
  INJECTOR,
  Injector,
  input,
  isDevMode,
  linkedSignal,
  contentChildren,
  contentChild,
  DestroyRef,
  signal,
  untracked,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import '@rxap/rxjs';
import {
  BaseDataSource,
  DataSourceLoader,
} from '@rxap/data-source';
import { AbstractTableDataSource } from '@rxap/data-source/table';
import { RxapFormControl } from '@rxap/forms';
import { WindowTableSelectOptions } from '@rxap/material-table-window-system';
import { Mixin } from '@rxap/mixin';
import { Method } from '@rxap/pattern';
import { coerceArray } from '@rxap/utilities';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';
import { ExtractTableSelectColumnMapMixin } from './extract-table-select-column-map.mixin';
import { ExtractTableSelectDataSourceMixin } from './extract-table-select-data-source.mixin';
import { ExtractTableSelectToDisplayMixin } from './extract-table-select-to-display.mixin';
import { ExtractTableSelectToValueMixin } from './extract-table-select-to-value.mixin';
import { OpenTableSelectWindowDirective } from './open-table-select-window.directive';
import { TableSelectColumn } from './open-table-select-window.method';
import { TableSelectInputComponent } from './table-select-input/table-select-input.component';

export interface TableSelectControlDirective<Data extends Record<string, any>>
  extends ExtractTableSelectDataSourceMixin<Data>, ExtractTableSelectToValueMixin, ExtractTableSelectToDisplayMixin,
    ExtractTableSelectColumnMapMixin {
}

@Mixin(ExtractTableSelectDataSourceMixin,
  ExtractTableSelectToValueMixin,
  ExtractTableSelectToDisplayMixin,
  ExtractTableSelectColumnMapMixin)
@Directive({
  selector: 'mat-form-field[rxapTableSelectControl]',
  standalone: true,
})
export class TableSelectControlDirective<Data extends Record<string, any> = Record<string, any>> {

  public readonly multiple = input<boolean>();

  public readonly openMethod = input.required<Method<Data[], WindowTableSelectOptions<Data>>>();

  public readonly dataInput = input<Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data>>(undefined, { alias: 'data' });
  public readonly data = linkedSignal(() => this.dataInput());

  public readonly columnsInput = input<Map<string, TableSelectColumn> | Record<string, TableSelectColumn>>(undefined, { alias: 'columns' });
  public readonly columns = linkedSignal(() => this.columnsInput());

  public ngControl: NgControl | null = null;

  public value: Data | null = null;

  public control!: RxapFormControl;

  public readonly openTableSelectWindow = contentChildren(OpenTableSelectWindowDirective);

  public readonly tableSelectInput = contentChild.required(TableSelectInputComponent);

  public readonly matLabel = contentChild<ElementRef>('mat-label');
  public readonly toValueInput = input<(value: Data) => unknown | Promise<unknown>>(undefined, { alias: 'toValue' });
  public readonly toValue = linkedSignal(() => this.toValueInput());
  public readonly injector: Injector          = inject(INJECTOR);
  // required for the use mixin ExtractDatasourceMixin
  public readonly dataSourceLoader            = inject(DataSourceLoader);
  protected readonly disabled                 = signal(false);
  protected matFormField: MatFormField | null = null;

  public get selected(): Data[] {
    return this.value !== null ? [ this.value ] : [];
  }

  public readonly toDisplayInput = input<(value: Data) => string | Promise<string>>(value => value as any, { alias: 'toDisplay' });
  public readonly toDisplay = linkedSignal(() => this.toDisplayInput());

  constructor() {
    // push the resolved inputs into the projected open table select window directives
    effect(() => {
      const windows = this.openTableSelectWindow();
      const columns = this.columns();
      const data = this.data();
      const toValue = this.toValue();
      const matLabel = this.matLabel();
      untracked(() => this.updateOpenTableSelectWindow(windows, columns, data, toValue, matLabel));
    });
    effect(() => {
      const windows = this.openTableSelectWindow();
      const disabled = this.disabled();
      untracked(() => windows.forEach(openTableSelectWindow => openTableSelectWindow.setDisabled(disabled)));
    });
    // react to the selection of the projected open table select window directives
    effect((onCleanup) => {
      const subscriptions = this.openTableSelectWindow().map(openTableSelectWindow =>
        openTableSelectWindow.selectedChange.subscribe($event => this.onSelected($event as Data[])),
      );
      onCleanup(() => subscriptions.forEach(subscription => subscription.unsubscribe()));
    });
    effect(() => {
      const toDisplay = this.toDisplay();
      const tableSelectInput = this.tableSelectInput();
      untracked(() => {
        if (toDisplay) {
          tableSelectInput.toDisplay = toDisplay.bind(this);
        }
      });
    });
    afterNextRender(() => this.initFromFormField());
  }

  private initFromFormField() {
    this.matFormField = this.injector.get(MatFormField, null);
    if (!this.matFormField) {
      throw new Error('The mat form field could not be injected');
    }
    this.ngControl = this.matFormField._control.ngControl as NgControl;
    if (this.ngControl) {
      const control = this.ngControl.control;
      if (control instanceof RxapFormControl) {
        this.control = control;
        this.data.set(this.extractTableSelectDataSource());
        this.toDisplay.set(this.extractTableSelectToDisplay() ?? this.toDisplay());
        this.toValue.set(this.extractTableSelectToValue() ?? this.toValue());
        this.columns.set(this.extractTableSelectColumnMap());
        control.disabled$.pipe(
          tap(disabled => this.disabled.set(disabled)),
          takeUntilDestroyed(this.destroyRef),
        ).subscribe();
      }
    } else {
      if (isDevMode()) {
        console.log('standalone mode');
      }
    }
  }

  private readonly destroyRef = inject(DestroyRef);

  private updateOpenTableSelectWindow(
    windows: readonly OpenTableSelectWindowDirective<any, any>[],
    columns: Map<string, TableSelectColumn> | Record<string, TableSelectColumn> | undefined,
    data: Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data> | undefined,
    toValue: ((value: Data) => unknown | Promise<unknown>) | undefined,
    matLabel: ElementRef | undefined,
  ) {
    for (const openTableSelectWindow of windows) {
      if (columns) {
        openTableSelectWindow.columns.set(columns);
      }
      if (data) {
        openTableSelectWindow.data.set(data);
      }
      if (toValue) {
        openTableSelectWindow.compareWith.set((o1: Data, o2: Data) => toValue(o1) === toValue(o2));
      }
      if (matLabel) {
        openTableSelectWindow.label.set(matLabel.nativeElement.innerText);
      }
      if (this.ngControl) {
        const control = this.ngControl.control;
        if (control?.value) {
          openTableSelectWindow.selected.set(coerceArray(control.value));
        }
      }
    }
  }

  private async onSelected($event: Data[]) {
    const tableSelectInput = this.tableSelectInput();
    if ($event?.length) {
      tableSelectInput.display = await this.toDisplay()($event[0]);
      this.value                    = $event[0];
      tableSelectInput.setValue(this.value);
    } else {
      this.value = null;
    }
  }

}
