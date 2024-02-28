export interface DashboardAccordionReferenceControllerGetChildrenParameter {
  uuid: string;
  pageIndex?: number;
  pageSize?: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<string>;
  parentUuid: string;
}
