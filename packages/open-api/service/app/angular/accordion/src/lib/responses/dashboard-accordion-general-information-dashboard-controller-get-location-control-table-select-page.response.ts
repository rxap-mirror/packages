export interface DashboardAccordionGeneralInformationDashboardControllerGetLocationControlTableSelectPageResponse {
  rows: Array<LocationTableSelectRowDtoResponse>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<FilterQueryDtoResponse>;
}

import type { LocationTableSelectRowDtoResponse } from './location-table-select-row-dto.response';
import type { FilterQueryDtoResponse } from './filter-query-dto.response';
