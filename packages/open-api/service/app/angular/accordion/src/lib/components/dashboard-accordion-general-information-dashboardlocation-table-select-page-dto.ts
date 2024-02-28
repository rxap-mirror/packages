export interface DashboardAccordionGeneralInformationDashboardlocationTableSelectPageDto {
  rows: Array<DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<FilterQueryDto>;
}

import type { DashboardAccordionGeneralInformationDashboardlocationTableSelectRowDto } from './dashboard-accordion-general-information-dashboardlocation-table-select-row-dto';
import type { FilterQueryDto } from './filter-query-dto';
