import { TableRowMetadata } from '@rxap/material-table-system';

export interface ITreeTableDemoTable extends Record<string, unknown>, TableRowMetadata {
  name: unknown;
  age: number;
  isActive: boolean;
  email: unknown;
  rating: number;
  accountStatus: unknown;
}
