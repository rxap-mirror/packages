export interface DashboardAccordionReferenceTreeTableItemDtoResponse {
  uuid: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceTreeTableItemDtoResponse>;
}
