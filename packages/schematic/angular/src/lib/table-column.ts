import {
  camelize,
  capitalize,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';

export interface TableColumnPipe {
  name: string;
  className: string;
  importFrom: string;
}

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
  nowrap?: boolean;
  cssClass?: string;
  role?: string;
  template?: string;
  pipeList?: Array<TableColumnPipe | string>;
}

export interface NormalizedTableColumn extends Readonly<Normalized<TableColumn>> {
  type: string;
  propertyPath: string;
  pipeList: TableColumnPipe[];
}

export function NormalizeTableColumnPipe(pipe: string | TableColumnPipe): TableColumnPipe {
  if (typeof pipe === 'string') {
    switch (pipe) {
      case 'async':
        return {
          name: 'async',
          className: 'AsyncPipe',
          importFrom: '@angular/common',
        };
      case 'date':
        return {
          name: 'date',
          className: 'DatePipe',
          importFrom: '@angular/common',
        };
      case 'json':
        return {
          name: 'json',
          className: 'JsonPipe',
          importFrom: '@angular/common',
        };
      case 'keyvalue':
        return {
          name: 'keyvalue',
          className: 'KeyValuePipe',
          importFrom: '@angular/common',
        };
      default:
        throw new Error(`Unknown pipe ${ pipe }`);
    }
  }
  return pipe;
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
  let nowrap = false;
  let cssClass: string | null = null;
  let role: string | null = null;
  let template: string | null = null;
  let pipeList: TableColumnPipe[] = [];
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
    nowrap = column.nowrap ?? false;
    cssClass = column.cssClass ?? cssClass;
    role = column.role ?? role;
    template = column.template ?? template;
    pipeList = (
      column.pipeList ?? pipeList
    ).map(NormalizeTableColumnPipe);
  }
  propertyPath ??= name
    .replace(/\?\./g, '.')
    .split('.')
    .map((part) => camelize(part))
    .join('?.');
  name = dasherize(name.replace(/\??\./g, '_'));
  title ??= dasherize(name)
    .replace(/_/g, '-')
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
  hasFilter = modifiers.includes('filter') || hasFilter;
  active = modifiers.includes('active') || active;
  inactive = modifiers.includes('inactive') || inactive;
  show = modifiers.includes('show') || show;
  hidden = modifiers.includes('hidden') || hidden;
  nowrap = modifiers.includes('nowrap') || nowrap;
  if (!type || type === 'unknown') {
    switch (role) {
      case 'date':
        type = 'number | Date';
        break;
      case 'link':
        type = 'string';
        break;
      case 'icon':
        // TODO : use the IconConfig type
        type = 'any';
        break;
      case 'boolean':
        type = 'boolean';
        break;
    }
  }
  type ??= 'unknown';
  if (nowrap) {
    if (!cssClass) {
      cssClass = 'nowrap';
    } else {
      cssClass += ' nowrap';
    }
  }
  return Object.seal({
    role,
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
    nowrap,
    cssClass,
    pipeList,
    template,
  });
}

export function NormalizeTableColumnList(
  columnList?: ReadonlyArray<string | Readonly<TableColumn>>,
): Array<NormalizedTableColumn> {
  return Object.seal(columnList?.map(NormalizeTableColumn) ?? []);
}
