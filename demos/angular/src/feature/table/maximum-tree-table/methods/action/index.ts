import { CalloutTableRowActionMethod } from './callout-table-row-action.method';
import { RXAP_TABLE_ROW_ACTION_METHOD } from '@rxap/material-table-system';
import { RefreshTableRowActionMethod } from './refresh-table-row-action.method';
import { ConfirmTableRowActionMethod } from './confirm-table-row-action.method';
import { FailTableRowActionMethod } from './fail-table-row-action.method';

export const TABLE_ROW_ACTION_METHODS = [
  {
    provide: RXAP_TABLE_ROW_ACTION_METHOD,
    useClass: CalloutTableRowActionMethod,
    multi: true,
  },
  {
    provide: RXAP_TABLE_ROW_ACTION_METHOD,
    useClass: RefreshTableRowActionMethod,
    multi: true,
  },
  {
    provide: RXAP_TABLE_ROW_ACTION_METHOD,
    useClass: ConfirmTableRowActionMethod,
    multi: true,
  },
  {
    provide: RXAP_TABLE_ROW_ACTION_METHOD,
    useClass: FailTableRowActionMethod,
    multi: true,
  },
];
