import { TableRowMetadata } from '@rxap/material-table-system';

export interface ICustomTemplateTable extends Record<string, unknown>, TableRowMetadata {
  name: unknown;
}
