export interface DashboardAccordionReferenceTreeTableControllerGetChildrenParameter {
  parentUuid: string;
  filter?: Array<string>;
  sortBy?: string;
  sortDirection?: string;
  pageSize?: number;
  pageIndex?: number;
}
