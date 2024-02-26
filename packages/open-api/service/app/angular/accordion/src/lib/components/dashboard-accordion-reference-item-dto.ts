export interface DashboardAccordionReferenceItemDto {
  referenced: boolean;
  name: string;
  type: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceItemDto>;
}
