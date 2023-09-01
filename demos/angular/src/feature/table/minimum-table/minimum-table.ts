import { TableRowMetadata } from '@rxap/material-table-system';
import { MinimumTableControllerGetPageResponse } from 'open-api-service-app-angular-table/responses/minimum-table-controller-get-page.response';

export type IMinimumTable = TableRowMetadata & MinimumTableControllerGetPageResponse['rows'][number];
