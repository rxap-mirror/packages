import {
  AfterContentInit,
  AfterViewInit,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  inject,
  INJECTOR,
  Injector,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
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
import { Subscription } from 'rxjs';
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
export class TableSelectControlDirective<Data extends Record<string, any> = Record<string, any>>
  implements AfterViewInit, AfterContentInit, OnChanges, OnDestroy {

  @Input()
  public multiple?: boolean;

  @Input()
  public openMethod!: Method<Data[], WindowTableSelectOptions<Data>>;

  @Input()
  public data?: Data[] | BaseDataSource<Data[]> | AbstractTableDataSource<Data>;

  @Input()
  public columns?: Map<string, TableSelectColumn> | Record<string, TableSelectColumn>;

  public ngControl: NgControl | null = null;

  public value: Data | null = null;

  public control!: RxapFormControl;

  @ContentChildren(OpenTableSelectWindowDirective)
  public openTableSelectWindow!: QueryList<OpenTableSelectWindowDirective<Data>>;

  @ContentChild(TableSelectInputComponent)
  public tableSelectInput!: TableSelectInputComponent;

  @ContentChild('mat-label')
  public matLabel?: ElementRef;
  @Input()
  public toValue?: (value: Data) => unknown | Promise<unknown>;
  public readonly injector: Injector          = inject(INJECTOR);
  // required for the use mixin ExtractDatasourceMixin
  public readonly dataSourceLoader            = inject(DataSourceLoader);
  protected disabled                          = false;
  protected matFormField: MatFormField | null = null;
  private readonly _subscription              = new Subscription();

  public get selected(): Data[] {
    return this.value !== null ? [ this.value ] : [];
  }

  @Input()
  public toDisplay: (value: Data) => string | Promise<string> = value => value as any;

  public ngOnChanges(changes: SimpleChanges) {
    const columnsChange = changes['columns'];
    const dataChange    = changes['data'];
    if (this.openTableSelectWindow) {
      if (columnsChange || dataChange) {
        this.updateOpenTableSelectWindow();
      }
    }
  }

  public ngAfterViewInit() {
    this.matFormField = this.injector.get(MatFormField, null);
    if (!this.matFormField) {
      throw new Error('The mat form field could not be injected');
    }
    this.ngControl = this.matFormField._control.ngControl as NgControl;
    if (this.ngControl) {
      this.data      = this.extractTableSelectDataSource();
      this.toDisplay = this.extractTableSelectToDisplay() ?? this.toDisplay;
      this.toValue   = this.extractTableSelectToValue() ?? this.toValue;
      this.columns   = this.extractTableSelectColumnMap();
      this.updateOpenTableSelectWindow();
      this._subscription?.add(this.control.disabled$.pipe(
        tap(disabled => this.disabled = disabled),
        tap(() => this.updateOpenTableSelectWindowDisabledState()),
      ).subscribe());
    } else {
      if (isDevMode()) {
        console.log('standalone mode');
      }
    }
    this.updateTableSelectInput();
  }

  public ngAfterContentInit() {
    this.updateOpenTableSelectWindow();
    for (const openTableSelectWindow of this.openTableSelectWindow) {
      this._subscription.add(openTableSelectWindow.selectedChange.pipe(
        tap($event => this.onSelected($event)),
      ).subscribe());
    }

  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  private updateTableSelectInput() {
    if (this.toDisplay) {
      this.tableSelectInput.toDisplay = this.toDisplay.bind(this);
    }
  }

  private updateOpenTableSelectWindowDisabledState() {
    for (const openTableSelectWindow of this.openTableSelectWindow) {
      openTableSelectWindow.disabled = this.disabled;
      openTableSelectWindow.checkInputs();
    }
  }

  private updateOpenTableSelectWindow() {
    for (const openTableSelectWindow of this.openTableSelectWindow) {
      openTableSelectWindow.disabled = this.disabled;
      if (this.columns) {
        openTableSelectWindow.columns = this.columns;
      }
      if (this.data) {
        openTableSelectWindow.data = this.data;
      }
      if (this.toValue) {
        openTableSelectWindow.compareWith = ((o1: Data, o2: Data) => {
          if (this.toValue) {
            return this.toValue(o1) === this.toValue(o2);
          }
          return o1 === o2;
        });
      }
      if (this.matLabel) {
        openTableSelectWindow.label = this.matLabel?.nativeElement.innerText;
      }
      if (this.ngControl) {
        const control = this.ngControl.control;
        if (control?.value) {
          openTableSelectWindow.selected = coerceArray(control.value);
        }
      }
      openTableSelectWindow.checkInputs();
    }
  }

  private async onSelected($event: Data[]) {
    if ($event?.length) {
      this.tableSelectInput.display = await this.toDisplay($event[0]);
      this.value                    = $event[0];
      this.tableSelectInput.setValue(this.value);
    } else {
      this.value = null;
    }
  }

}
