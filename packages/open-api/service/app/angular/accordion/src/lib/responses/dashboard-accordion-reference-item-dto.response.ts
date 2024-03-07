export interface DashboardAccordionReferenceItemDtoResponse {
  referenced: boolean;
  name: string;
  type: string;
  hasChildren: boolean;
  children?: Array<DashboardAccordionReferenceItemDtoResponse>;
  uuid: string;
}
