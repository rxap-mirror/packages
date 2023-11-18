import { TableRowMetadata } from '@rxap/material-table-system';

export interface IPipeTable extends Record<string, unknown>, TableRowMetadata {
  name: unknown;
}
