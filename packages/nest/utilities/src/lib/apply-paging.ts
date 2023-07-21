import { ApplyFilter } from './apply-filter';
import { ApplySort } from './apply-sort';
import { FilterQuery } from './filter-query.pipe';

export function ApplyPaging<T>(
  data: T[],
  sortBy: string,
  sortDirection: string,
  pageSize: number,
  pageIndex: number,
  filter?: FilterQuery[],
) {
  let rows = ApplySort(data, sortBy, sortDirection);
  rows = ApplyFilter(rows, filter);
  const total = rows.length;
  rows = rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  return { total, rows };
}
