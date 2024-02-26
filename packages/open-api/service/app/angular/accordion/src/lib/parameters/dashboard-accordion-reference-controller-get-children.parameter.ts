export interface DashboardAccordionReferenceControllerGetChildrenParameter {
  parentUuid: string;
  filter?: Array<string>;
  sortBy?: string;
  sortDirection?: string;
  pageSize?: number;
  pageIndex?: number;
}
