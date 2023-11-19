import { Normalized } from '@rxap/utilities';
import { NormalizedTableColumn } from './table-column';

export interface TableProperty {
  name: string;
  type?: string;
}

export interface NormalizedTableProperty extends Readonly<Normalized<TableProperty>> {
  type: string;
}

export function NormalizeTableProperty(property: string | TableProperty): NormalizedTableProperty {
  let name: string;
  let type = 'unknown';
  if (typeof property === 'string') {
    // name:type
    // username:string
    const fragments = property.split(':');
    name = fragments[0];
    type = fragments[1] || type; // convert an empty string to undefined
  } else {
    name = property.name;
    type = property.type ?? type;
  }
  type ??= 'unknown';
  name = name.replace(/\.\?/g, '.').split('.').join('.?');
  return Object.freeze({
    name,
    type,
  });
}

export function NormalizeTablePropertyList(propertyList?: Array<string | TableProperty>): ReadonlyArray<NormalizedTableProperty> {
  return Object.freeze(propertyList?.map(NormalizeTableProperty) ?? []);
}

export function MergeWithColumnList(
  propertyList: ReadonlyArray<NormalizedTableProperty>,
  columnList: ReadonlyArray<NormalizedTableColumn>,
): ReadonlyArray<NormalizedTableProperty> {
  const merged: NormalizedTableProperty[] = [ ...propertyList ];
  for (const column of columnList) {
    if (!merged.find((property) => property.name === column.propertyPath)) {
      merged.push({
        name: column.propertyPath,
        type: column.type,
      });
    }
  }
  return Object.freeze(merged);
}
