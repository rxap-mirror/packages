import { TableRowMetadata } from '@rxap/material-table-system';
import { MinimumTableControllerGetPageResponse } from 'open-api-service-app-angular-table/responses/minimum-table-controller-get-page.response';

export type IMinimumTable = TableRowMetadata &
  MinimumTableControllerGetPageResponse['rows'][number];

export interface IMinimumTable
  extends Record<string, unknown>,
    TableRowMetadata {
  name: string;
  age: number;
  isActive: boolean;
  email: unknown;
  rating: number;
  accountStatus: unknown;
}
