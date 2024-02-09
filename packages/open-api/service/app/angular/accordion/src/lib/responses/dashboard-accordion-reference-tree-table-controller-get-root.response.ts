export type DashboardAccordionReferenceTreeTableControllerGetRootResponse = Array<{
    uuid: string;
    hasChildren: boolean;
    children?: Array<DashboardAccordionReferenceTreeTableItemDtoResponse>;
  }>;
import type { DashboardAccordionReferenceTreeTableItemDtoResponse } from './dashboard-accordion-reference-tree-table-item-dto.response';
