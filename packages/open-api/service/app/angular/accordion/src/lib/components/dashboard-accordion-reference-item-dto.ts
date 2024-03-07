import type { IconDto } from './icon-dto';

export interface DashboardAccordionReferenceItemDto {
  type: unknown;
  referenceUuid: string;
  icon?: IconDto;
  isReferenced: boolean;
  name: string;
  scopeType: number;
  uuid: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceItemDto>;
}
