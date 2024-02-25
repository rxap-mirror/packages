export interface DashboardAccordionReferenceTreeTableItemDtoResponse {
  referenced: boolean;
  name: string;
  type: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceTreeTableItemDtoResponse>;
}
