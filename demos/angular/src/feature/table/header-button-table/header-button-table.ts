import { TableRowMetadata } from '@rxap/material-table-system';

export interface IHeaderButtonTable
  extends Record<string, unknown>,
    TableRowMetadata {
  name: string;
  age: number;
  isActive: boolean;
  email: unknown;
  rating: number;
  accountStatus: unknown;
}
