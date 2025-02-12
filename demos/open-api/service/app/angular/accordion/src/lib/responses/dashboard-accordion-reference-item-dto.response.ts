import type { IconDtoResponse } from './icon-dto.response';

export interface DashboardAccordionReferenceItemDtoResponse {
  type: unknown;
  referenceUuid: string;
  icon?: IconDtoResponse;
  isReferenced: boolean;
  name: string;
  scopeType: number;
  uuid: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceItemDtoResponse>;
}
