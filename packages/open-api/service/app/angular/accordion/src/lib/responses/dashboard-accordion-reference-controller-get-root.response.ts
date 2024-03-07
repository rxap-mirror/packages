export type DashboardAccordionReferenceControllerGetRootResponse = Array<{
    type: unknown;
    referenceUuid: string;
    icon?: IconDtoResponse;
    isReferenced: boolean;
    name: string;
    scopeType: number;
    uuid: string;
    hasChildren: boolean;
    children?: Array<DashboardAccordionReferenceItemDtoResponse>;
  }>;
import type { DashboardAccordionReferenceItemDtoResponse } from './dashboard-accordion-reference-item-dto.response';
import type { IconDtoResponse } from './icon-dto.response';
