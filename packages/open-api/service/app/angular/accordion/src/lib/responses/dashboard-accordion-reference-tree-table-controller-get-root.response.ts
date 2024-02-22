export type DashboardAccordionReferenceTreeTableControllerGetRootResponse = Array<{
    uuid: string;
    hasChildren: boolean;
    referenced: boolean;
    name: string;
    type: string;
    children?: Array<DashboardAccordionReferenceTreeTableItemDtoResponse>;
  }>;
import type { DashboardAccordionReferenceTreeTableItemDtoResponse } from './dashboard-accordion-reference-tree-table-item-dto.response';
