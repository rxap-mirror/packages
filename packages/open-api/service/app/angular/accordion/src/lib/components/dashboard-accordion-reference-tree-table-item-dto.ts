export interface DashboardAccordionReferenceTreeTableItemDto {
  uuid: string;
  hasChildren: boolean;
  referenced: boolean;
  name: string;
  type: string;
  children?: Array<DashboardAccordionReferenceTreeTableItemDto>;
}
