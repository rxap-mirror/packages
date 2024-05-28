import { TableRowMetadata } from '@rxap/material-table-system';
import { IconConfig } from '@rxap/utilities';

export interface IMaximumTreeTable
  extends Record<string, unknown>,
    TableRowMetadata {
  icon: IconConfig;
  name: string;
  age: number;
  isActive: boolean;
  email: unknown;
  rating: number;
  accountStatus: unknown;
}
