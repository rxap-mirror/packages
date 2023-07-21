import { hasIndexSignature } from './has-index-signature';

export function ApplySort<T>(rows: T[], sortDirection?: string, sortBy?: string) {
  if (sortBy) {
    sortDirection ??= 'asc';
    rows = rows.sort((a, b) => {
      if (!hasIndexSignature(a) || !hasIndexSignature(b)) {
        return 0;
      }
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      if (valueA === valueB) {
        return 0;
      }
      if (valueA === undefined) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      if (valueB === undefined) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return String(valueA).localeCompare(String(valueB)) * (sortDirection === 'asc' ? 1 : -1);
    });
  }
  return rows;
}
