import { TableRowMetadata } from '@rxap/material-table-system';
import { DashboardAccordionReferenceTreeTableControllerGetPageResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-reference-tree-table-controller-get-page.response';

export type IReferenceTreeTable = TableRowMetadata & DashboardAccordionReferenceTreeTableControllerGetPageResponse['rows'][number];
