export type DashboardAccordionReferenceControllerGetChildrenResponse = Array<{
    referenced: boolean;
    name: string;
    type: string;
    hasChildren: boolean;
    children?: Array<DashboardAccordionReferenceItemDtoResponse>;
    uuid: string;
  }>;
import type { DashboardAccordionReferenceItemDtoResponse } from './dashboard-accordion-reference-item-dto.response';
