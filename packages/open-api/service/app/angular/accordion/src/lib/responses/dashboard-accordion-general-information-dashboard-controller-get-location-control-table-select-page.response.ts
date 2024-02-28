export interface DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse {
  rows: Array<DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDtoResponse>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<FilterQueryDtoResponse>;
}

import type { DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDtoResponse } from './dashboard-accordion-general-information-dashboardlocation-table-select-row-dto.response';
import type { FilterQueryDtoResponse } from './filter-query-dto.response';
