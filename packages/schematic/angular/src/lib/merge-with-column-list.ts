import { NormalizedDataProperty } from '@rxap/ts-morph';
import { NormalizedTableColumn } from './table-column';

export function MergeWithColumnList(
  propertyList: ReadonlyArray<NormalizedDataProperty>,
  columnList: ReadonlyArray<NormalizedTableColumn>,
): ReadonlyArray<NormalizedDataProperty> {
  const merged: NormalizedDataProperty[] = [ ...propertyList ];
  for (const column of columnList) {
    if (!merged.find((property) => property.name === column.propertyPath)) {
      merged.push({
        name: column.propertyPath,
        type: column.type,
        isArray: false, // TODO : support array property for table columns
        source: column.source,
        isOptional: column.isOptional,
      });
    }
  }
  return Object.freeze(merged);
}
