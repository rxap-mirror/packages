import { Provider } from '@angular/core';
import { RXAP_TABLE_FILTER, TableColumnFilterService } from '@rxap/material-table-system';
import { ExpandRowService } from '../src/lib/expand-row/expand-row.service';
import { SelectRowService } from '../src/lib/select-row/select-row.service';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * Collected by the @rxap/plugin-ng-prism:init-library generator.
 */
export const PRISM_PROVIDERS: Provider[] = [
  SelectRowService,
  ExpandRowService,
  // the TableColumnFilterService supports the column filter and the full text search directive
  {
    provide: RXAP_TABLE_FILTER,
    useClass: TableColumnFilterService,
  },
];
