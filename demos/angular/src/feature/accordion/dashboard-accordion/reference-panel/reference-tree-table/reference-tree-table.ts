import { TableRowMetadata } from '@rxap/material-table-system';
import { DashboardAccordionReferenceTreeTableControllerGetRootResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-reference-tree-table-controller-get-root.response';

export type IReferenceTreeTable = TableRowMetadata & DashboardAccordionReferenceTreeTableControllerGetRootResponse[number];
