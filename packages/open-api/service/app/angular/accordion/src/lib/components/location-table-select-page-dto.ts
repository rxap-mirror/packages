export interface LocationTableSelectPageDto {
  rows: Array<LocationTableSelectRowDto>;
  pageSize: number;
  pageIndex: number;
  total: number;
  sortDirection?: string;
  sortBy?: string;
  filter?: Array<FilterQueryDto>;
}
import type { LocationTableSelectRowDto } from './location-table-select-row-dto';
import type { FilterQueryDto } from './filter-query-dto';
