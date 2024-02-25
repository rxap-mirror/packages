export type DashboardAccordionReferenceTreeTableControllerGetChildrenResponse = Array<{
    referenced: boolean;
    name: string;
    type: string;
    hasChildren: boolean;
    children?: Array<DashboardAccordionReferenceTreeTableItemDtoResponse>;
  }>;
import type { DashboardAccordionReferenceTreeTableItemDtoResponse } from './dashboard-accordion-reference-tree-table-item-dto.response';
