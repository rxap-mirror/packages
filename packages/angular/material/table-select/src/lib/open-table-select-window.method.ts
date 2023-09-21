import {
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  StaticProvider,
  ViewContainerRef,
} from '@angular/core';
import {
  BaseDataSource,
  staticDataSource,
} from '@rxap/data-source';
import {
  AbstractTableDataSource,
  TableDataSource,
} from '@rxap/data-source/table';
import {
  RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
  RXAP_TABLE_FILTER,
  RXAP_TABLE_METHOD,
  TABLE_DATA_SOURCE,
  TABLE_REMOTE_METHOD_ADAPTER_FACTORY,
} from '@rxap/material-table-system';
import { Method } from '@rxap/pattern';
import '@rxap/rxjs';
import {
  RXAP_WINDOW_SETTINGS,
  WindowConfig,
  WindowService,
} from '@rxap/window-system';
import {
  firstValueFrom,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateFilterFormProvider } from './create-filter-form-provider';
import { TableSelectWindowComponent } from './table-select-window/table-select-window.component';

export interface SelectColumn {
  label: string;
  type?: string;
  filter?: boolean;

  [key: string]: any;
}

export interface BooleanColumn extends SelectColumn {
  type: 'boolean';
}

export interface DateColumn extends SelectColumn {
  type: 'date';
  format?: string;
}

export type TableSelectColumn = BooleanColumn | DateColumn | SelectColumn;

export type TableSelectColumnMap = ReadonlyMap<string, TableSelectColumn>;

export interface OpenTableSelectWindowMethodParameters<Data extends Record<string, any> = Record<string, any>> {
  multiple?: boolean;
  columns: TableSelectColumnMap;
  data: AbstractTableDataSource<Data> | BaseDataSource<Data[]> | Data[];
  windowConfig?: Omit<Omit<Omit<WindowConfig, 'component'>, 'injector'>, 'viewContainerRef'>;
  viewContainerRef?: ViewContainerRef;
  /**
   * (optional) The parameters Observable passed to the tableDirective and then joined with the parameters used in the
   * TableDataSource http request
   *
   * Use to add additional parameters to the http request
   */
  parameters?: Observable<Record<string, any>>;
  injector?: Injector;
  selected?: Data[];
  /**
   * true - the table header row is visible
   */
  showHeader?: boolean;
  title: string;
  id: string;
  compareWith?: (o1: Data, o2: Data) => boolean;
}

@Injectable()
export class OpenTableSelectWindowMethod<Data extends Record<string, any> = Record<string, any>>
  implements Method<Data[], OpenTableSelectWindowMethodParameters<Data>> {

  constructor(
    private readonly windowService: WindowService,
    @Inject(INJECTOR)
    private readonly injector: Injector,
  ) {
  }

  public call(parameters: OpenTableSelectWindowMethodParameters<Data>): Promise<Data[]> {

    const providers: StaticProvider[] = [
      {
        provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
        useValue: {
          multiple: parameters.multiple ?? false,
          selected: parameters.selected ?? [],
          compareWith: parameters.compareWith,
        },
      },
    ];

    if (Array.isArray(parameters.data)) {
      providers.push({
        provide: TABLE_DATA_SOURCE,
        useValue: new TableDataSource(staticDataSource(parameters.data)),
      });
    } else if (parameters.data instanceof AbstractTableDataSource) {
      providers.push({
        provide: TABLE_DATA_SOURCE,
        useValue: parameters.data,
      });
    } else {
      providers.push({
        provide: TABLE_DATA_SOURCE,
        useValue: new TableDataSource(parameters.data),
      });
    }

    providers.push({
      provide: RXAP_TABLE_METHOD,
      useValue: null,
    });

    providers.push({
      provide: TABLE_REMOTE_METHOD_ADAPTER_FACTORY,
      useValue: null,
    });

    providers.push({
      provide: RXAP_TABLE_FILTER,
      useValue: null,
    });

    providers.push({
      provide: RXAP_WINDOW_SETTINGS,
      useValue: null,
    });

    providers.push(CreateFilterFormProvider(parameters.columns));

    const windowRef = this.windowService.open({
      ...parameters.windowConfig,
      viewContainerRef: parameters.viewContainerRef,
      injector: Injector.create({
        parent: parameters.injector ?? this.injector,
        providers,
      }),
      title: parameters.title ?? $localize`Select`,
      data: parameters,
      component: TableSelectWindowComponent,
    });

    return firstValueFrom(windowRef.pipe(map(selected => selected ?? [])));

  }

}
