import { Normalized } from '@rxap/utilities';
import {
  camelize,
  capitalize,
  dasherize,
} from '@rxap/schematics-utilities';

export interface TableColumn {
  name: string;
  type?: string;
  modifiers?: string[];
  hasFilter?: boolean;
  title?: string;
  propertyPath?: string;
  hidden?: boolean;
  active?: boolean;
  inactive?: boolean;
  show?: boolean;
}

export interface NormalizedTableColumn extends Readonly<Normalized<TableColumn>> {
  type: string;
}

export function NormalizeTableColumn(
  column: Readonly<TableColumn> | string,
): NormalizedTableColumn {
  let name: string;
  let type = 'unknown';
  let modifiers: string[] = [];
  let hasFilter = false;
  let title: string | null = null;
  let propertyPath: string | null = null;
  let hidden = false;
  let active = false;
  let inactive = false;
  let show = false;
  if (typeof column === 'string') {
    // name:type:modifier1,modifier2
    // username:string:filter,active
    const fragments = column.split(':');
    name = fragments[0];
    type = fragments[1] || type; // convert an empty string to undefined
    if (fragments[2]) {
      modifiers = fragments[2].split(/,(?![^(]*\))/g);
    }
    propertyPath = fragments[3] || propertyPath;
  } else {
    name = column.name;
    type = column.type ?? type;
    modifiers = column.modifiers ?? [];
    hasFilter = column.hasFilter ?? false;
    title = column.title ?? title;
    propertyPath = column.propertyPath ?? propertyPath;
    hidden = column.hidden ?? false;
    active = column.active ?? false;
    inactive = column.inactive ?? false;
    show = column.show ?? false;
  }
  propertyPath ??= name
    .split('.')
    .map((part) => camelize(part))
    .join('.');
  title ??= dasherize(name)
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
  hasFilter = modifiers.includes('filter') || hasFilter;
  active = modifiers.includes('active') || active;
  inactive = modifiers.includes('inactive') || inactive;
  show = modifiers.includes('show') || show;
  hidden = modifiers.includes('hidden') || hidden;
  type ??= 'unknown';
  return Object.seal({
    name,
    type,
    modifiers,
    hasFilter,
    title,
    propertyPath,
    hidden,
    active,
    inactive,
    show,
  });
}

export function NormalizeTableColumnList(
  columnList?: ReadonlyArray<string | Readonly<TableColumn>>,
): Array<NormalizedTableColumn> {
  return Object.seal(columnList?.map(NormalizeTableColumn) ?? []);
}
