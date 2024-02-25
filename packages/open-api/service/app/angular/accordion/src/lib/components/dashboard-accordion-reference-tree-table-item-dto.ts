export interface DashboardAccordionReferenceTreeTableItemDto {
  referenced: boolean;
  name: string;
  type: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceTreeTableItemDto>;
}
