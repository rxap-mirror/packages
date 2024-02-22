export interface DashboardAccordionReferenceTreeTableItemDtoResponse {
  uuid: string;
  hasChildren: boolean;
  referenced: boolean;
  name: string;
  type: string;
  children?: Array<DashboardAccordionReferenceTreeTableItemDtoResponse>;
}
