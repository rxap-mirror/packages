import { ApplyFilter } from './apply-filter';
import { ApplySort } from './apply-sort';
import { FilterQuery } from './filter-query.pipe';

/**
 * Apply paging to an array of data.
 *
 * @param {T[]} data - The array of data to apply paging to.
 * @param {string} sortBy - The property to sort the data by.
 * @param {string} sortDirection - The sort direction. Valid values are "asc" or "desc".
 * @param {number} pageSize - The number of items to include in each page.
 * @param {number} pageIndex - The index of the current page.
 * @param {FilterQuery[]} [filter] - Optional filters to apply to the data.
 *
 * @returns {object} - An object with the paginated data and total count.
 *                    - total: The total number of items before pagination.
 *                    - rows: The current page of data.
 */
export function ApplyPaging<T>(
  data: T[],
  sortBy: string,
  sortDirection: string,
  pageSize: number,
  pageIndex: number,
  filter?: FilterQuery[],
) {
  let rows = ApplySort(data, sortDirection, sortBy);
  rows = ApplyFilter(rows, filter);
  const total = rows.length;
  rows = rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  return { total, rows };
}
