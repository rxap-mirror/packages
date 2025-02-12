export interface DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse {
  rows: Array<DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDtoResponse>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<FilterQueryDtoResponse>;
}

import type { DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDtoResponse } from './dashboard-accordion-general-information-dashboard-location-table-select-row-dto.response';
import type { FilterQueryDtoResponse } from './filter-query-dto.response';
