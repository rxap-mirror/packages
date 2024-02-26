import { TableRowMetadata } from '@rxap/material-table-system';
import { DashboardAccordionReferenceControllerGetRootResponse } from 'open-api-service-app-angular-accordion/responses/dashboard-accordion-reference-controller-get-root.response';

export type IReferenceTreeTable = TableRowMetadata & DashboardAccordionReferenceControllerGetRootResponse[number];
