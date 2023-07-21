import { FilterQuery } from './filter-query.pipe';
import { hasIndexSignature } from './has-index-signature';

export function ApplyFilter<T>(rows: T[], filter?: FilterQuery[]) {
  if (filter?.length) {
    for (const query of filter) {
      rows = rows.filter(row => {
        if (hasIndexSignature(row)) {
          const element = row[query.column];
          if (element !== null && element !== undefined) {
            return String(element).toLowerCase().includes(query.filter.toLowerCase());
          }
        }
        return true;
      });
    }
  }
  return rows;
}
