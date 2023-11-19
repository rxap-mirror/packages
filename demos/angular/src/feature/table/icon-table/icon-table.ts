import { TableRowMetadata } from '@rxap/material-table-system';
import { IconConfig } from '@rxap/utilities';

export interface IIconTable extends Record<string, unknown>, TableRowMetadata {
  icon: IconConfig;
}
