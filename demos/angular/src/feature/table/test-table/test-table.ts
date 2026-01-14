import { TableRowMetadata } from '@rxap/material-table-system';
import { TestTableControllerGetPageResponse } from 'open-api-service-nest/src/lib/responses';

export type ITestTable = TableRowMetadata &
  TestTableControllerGetPageResponse['rows'][number];
