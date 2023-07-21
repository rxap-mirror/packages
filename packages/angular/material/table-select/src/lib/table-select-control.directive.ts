import {
  AfterContentInit,
  AfterViewInit,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
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
import {
  BaseDataSource,
  DataSourceLoader,
} from '@rxap/data-source';
import { AbstractTableDataSource } from '@rxap/data-source/table';
import { RxapFormSystemError } from '@rxap/form-system';
import { RxapFormControl } from '@rxap/forms';
import {
  ExtractDatasourceMixin,
  WindowTableSelectOptions,
} from '@rxap/material-table-window-system';
import { Mixin } from '@rxap/mixin';
import { Method } from '@rxap/pattern';
import { getMetadata } from '@rxap/reflect-metadata';
import '@rxap/rxjs';
import { coerceArray } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  TABLE_SELECT_COLUMN_MAP,
  TABLE_SELECT_DATA_SOURCE,
  TABLE_SELECT_TO_DISPLAY,
  TABLE_SELECT_TO_VALUE,
} from './decorators';
import { OpenTableSelectWindowDirective } from './open-table-select-window.directive';
import { TableSelectColumn } from './open-table-select-window.method';
import { TableSelectInputComponent } from './table-select-input/table-select-input.component';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TableSelectControlDirective<Data extends Record<string, any>> extends ExtractDatasourceMixin {
}

@Mixin(ExtractDatasourceMixin)
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
  protected disabled = false;
  private readonly _subscription = new Subscription();

  constructor(
    public readonly injector: Injector,
    // required for the use mixin ExtractDatasourceMixin
    public readonly dataSourceLoader: DataSourceLoader,
    private readonly matFormField: MatFormField,
  ) {
  }

  public get selected(): Data[] {
    return this.value !== null ? [ this.value ] : [];
  }

  @Input()
  public toDisplay: (value: Data) => string | Promise<string> = value => value as any;

  public ngOnChanges(changes: SimpleChanges) {
    const columnsChange = changes['columns'];
    const dataChange = changes['data'];
    if (this.openTableSelectWindow) {
      if (columnsChange || dataChange) {
        this.updateOpenTableSelectWindow();
      }
    }
  }

  public ngAfterViewInit() {
    this.ngControl = this.matFormField._control?.ngControl as NgControl | null;
    if (this.ngControl) {
      const control = this.ngControl.control;
      if (!control) {
        throw new Error('The control container does not have a control object');
      }
      if (control instanceof RxapFormControl) {
        // TODO : replace with custom data source extractor
        this.data =
          this.extractDatasource(TABLE_SELECT_DATA_SOURCE, this.control = control) as any as BaseDataSource<Data[]>;
        this.toDisplay = this.extractTableSelectToDisplay(this.control = control) ?? this.toDisplay;
        this.toValue = this.extractTableSelectToValue(this.control = control);
        this.columns = this.extractTableSelectColumnMap(this.control = control);
        this.updateOpenTableSelectWindow();
        this._subscription?.add(control.disabled$.pipe(
          tap(disabled => this.disabled = disabled),
          tap(() => this.updateOpenTableSelectWindowDisabledState()),
        ).subscribe());
      } else {
        console.warn('The control in the ControlContainer is not a RxapFormControl. Can not extract the data source');
      }
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
      this.value = $event[0];
      this.tableSelectInput.setValue(this.value);
    } else {
      this.value = null;
    }
  }

  private extractTableSelectColumnMap(control: RxapFormControl = this.control) {
    // TODO : create utility function to extract metadata for a specific control
    const formDefinition = this.extractFormDefinition(control);
    const map = getMetadata<Map<string, Record<string, TableSelectColumn>>>(
      TABLE_SELECT_COLUMN_MAP,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError('Could not extract the use data source map from the form definition instance', '');
    }

    if (!map.has(control.controlId)) {
      throw new RxapFormSystemError('A use data source definition does not exists in the form definition metadata', '');
    }

    return map.get(control.controlId)!;
  }


  private extractTableSelectToDisplay(control: RxapFormControl = this.control) {
    // TODO : create utility function to extract metadata for a specific control
    const formDefinition = this.extractFormDefinition(control);
    const map = getMetadata<Map<string, (value: Data) => string | Promise<string>>>(
      TABLE_SELECT_TO_DISPLAY,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError('Could not extract the use data source map from the form definition instance', '');
    }

    if (!map.has(control.controlId)) {
      throw new RxapFormSystemError('A use data source definition does not exists in the form definition metadata', '');
    }

    return map.get(control.controlId)!;
  }

  private extractTableSelectToValue(control: RxapFormControl = this.control) {
    // TODO : create utility function to extract metadata for a specific control
    const formDefinition = this.extractFormDefinition(control);
    const map = getMetadata<Map<string, (value: Data) => string | Promise<string>>>(
      TABLE_SELECT_TO_VALUE,
      Object.getPrototypeOf(formDefinition),
    );

    if (!map) {
      throw new RxapFormSystemError('Could not extract the use data source map from the form definition instance', '');
    }

    if (!map.has(control.controlId)) {
      throw new RxapFormSystemError('A use data source definition does not exists in the form definition metadata', '');
    }

    return map.get(control.controlId)!;
  }

}
