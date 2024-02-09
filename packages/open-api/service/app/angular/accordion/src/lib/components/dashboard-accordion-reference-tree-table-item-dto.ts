export interface DashboardAccordionReferenceTreeTableItemDto {
  uuid: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceTreeTableItemDto>;
}
