import {
  ComponentRef,
  Inject,
  Injectable,
  INJECTOR,
  Injector,
  StaticProvider,
  ViewContainerRef,
} from '@angular/core';
import {
  RXAP_WINDOW_SETTINGS,
  WindowConfig,
  WindowRef,
  WindowService,
} from '@rxap/window-system';
import { ComponentType } from '@angular/cdk/overlay';
import {
  RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
  RXAP_TABLE_METHOD,
  TABLE_DATA_SOURCE,
  TABLE_REMOTE_METHOD,
  TableSelectControlsComponent,
} from '@rxap/material-table-system';
import {
  map,
  take,
  tap,
} from 'rxjs/operators';
import { BaseDataSource } from '@rxap/data-source';
import { TableDataSource } from '@rxap/data-source/table';
import { ComponentPortal } from '@angular/cdk/portal';

export interface WindowTableSelectOptions<RowData> {
  title?: string;
  multiple?: boolean;
  selected?: RowData[];
  data?: BaseDataSource<RowData[]>;
  viewContainerRef?: ViewContainerRef;
  injector: Injector;
}

declare const $localize: any;

@Injectable({ providedIn: 'root' })
export class WindowTableSelectService {
  constructor(
    @Inject(WindowService)
    private readonly windowService: WindowService,
    @Inject(INJECTOR)
    private readonly injector: Injector,
  ) {
  }

  public open<RowData extends Record<string, any>>(
    component: ComponentType<any>,
    options: WindowTableSelectOptions<RowData>,
    windowConfig: Omit<WindowConfig, 'component'> = {},
  ): Promise<RowData[]> & { windowRef: WindowRef } {
    const providers: StaticProvider[] = [
      {
        provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
        useValue: {
          multiple: options.multiple ?? false,
          selected: options.selected ?? [],
        },
      },
      {
        provide: RXAP_WINDOW_SETTINGS,
        useValue: {
          title:
            options.title ??
            $localize`:@@rxap.window-table-system.select-table.title:Select Options`,
        },
      },
    ];

    if (options.data) {
      providers.push({
        provide: TABLE_DATA_SOURCE,
        useValue: new TableDataSource<RowData>(options.data),
      });
    } else {
      providers.push({
        provide: TABLE_DATA_SOURCE,
        useValue: null,
      });
    }

    providers.push({
      provide: TABLE_REMOTE_METHOD,
      useValue: null,
    });

    providers.push({
      provide: RXAP_TABLE_METHOD,
      useValue: null,
    });

    const windowRef = this.windowService.open({
      ...windowConfig,
      viewContainerRef: options.viewContainerRef,
      injector: Injector.create({
        parent: options.injector ?? windowConfig.injector ?? this.injector,
        providers,
      }),
      component,
    });

    windowRef.attachedRef$
             .pipe(
               take(1),
               tap((attachedRef) => {
                 if (attachedRef instanceof ComponentRef) {
                   windowRef.setFooterPortal(
                     new ComponentPortal(
                       TableSelectControlsComponent,
                       options.viewContainerRef,
                       attachedRef.injector,
                     ),
                   );
                 } else {
                   throw new Error(
                     'FATAL: the attached ref was not an instance of Component ref',
                   );
                 }
               }),
             )
             .subscribe();

    const promise: Promise<RowData[]> & { windowRef?: WindowRef } = windowRef.closed$
                                                                             .pipe(
                                                                               take(1),
                                                                               map((selected) => selected ?? []),
                                                                             )
                                                                             .toPromise();

    // add the windowRef to the promise instance
    // The windowRef instance can be used to cancel the window
    // If the calling component / directive is destroyed the created window should
    // be also destroyed
    promise.windowRef = windowRef;

    return promise as Promise<RowData[]> & { windowRef: WindowRef };
  }
}
