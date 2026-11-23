import { Provider } from '@angular/core';
import { RXAP_WINDOW_REF } from '@rxap/window-system';
import { ExpandRowService } from '../src/lib/expand-row/expand-row.service';
import { SelectRowOptions } from '../src/lib/select-row/select-row.options';
import { SelectRowService } from '../src/lib/select-row/select-row.service';
import { RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS } from '../src/lib/select-row/tokens';
import { TableColumnFilterService } from '../src/lib/table-column-filter/table-column-filter.service';
import { RXAP_TABLE_FILTER } from '../src/lib/table-data-source.directive';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  SelectRowService,
  ExpandRowService,
  {
    provide: RXAP_MATERIAL_TABLE_SYSTEM_SELECT_ROW_OPTIONS,
    useValue: {
      multiple: true,
      selected: [ { uuid: 'prism-selected' } ],
    } satisfies SelectRowOptions,
  },
  // the TableColumnFilterService supports the column filter and the full text search directive
  {
    provide: RXAP_TABLE_FILTER,
    useClass: TableColumnFilterService,
  },
  // the table select controls close the window. The styleguide has no window
  {
    provide: RXAP_WINDOW_REF,
    useValue: {
      close: () => undefined,
      complete: () => undefined,
      next: () => undefined,
    },
  },
];
