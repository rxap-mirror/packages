export interface DashboardAccordionGeneralInformationDashboardLocationTableSelectPageDto {
  rows: Array<DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<FilterQueryDto>;
}

import type { DashboardAccordionGeneralInformationDashboardLocationTableSelectRowDto } from './dashboard-accordion-general-information-dashboard-location-table-select-row-dto';
import type { FilterQueryDto } from './filter-query-dto';
