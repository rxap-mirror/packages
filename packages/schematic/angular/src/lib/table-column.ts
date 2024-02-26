import {
  camelize,
  capitalize,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  classify,
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import {
  BaseFormControl,
  FormControlKinds,
} from './form-control';
import { NormalizeFormDefinitionControl } from './form-definition-control';
import { LoadHandlebarsTemplate } from './load-handlebars-template';

export type TableColumnPipe = TypeImport;

export enum TableColumnModifier {
  FILTER = 'filter',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SHOW = 'show',
  HIDDEN = 'hidden',
  NOWRAP = 'nowrap',
  WITHOUT_TITLE = 'withoutTitle',
  NO_TITLE = 'noTitle',
  OVERWRITE = 'overwrite',
}

export function IsTableColumnModifier(value: string): value is TableColumnModifier {
  return Object.values(TableColumnModifier).includes(value as TableColumnModifier);
}

export enum TableColumnKind {
  DEFAULT = 'default',
  DATE = 'date',
  LINK = 'link',
  ICON = 'icon',
  BOOLEAN = 'boolean',
  COMPONENT = 'component',
  COPY_TO_CLIPBOARD = 'copy-to-clipboard',
}

export function IsTableColumnKind(value: string): value is TableColumnKind {
  return Object.values(TableColumnKind).includes(value as TableColumnKind);
}

export interface TableColumn {
  name: string;
  type?: string | TypeImport;
  modifiers?: string[];
  hasFilter?: boolean;
  withoutTitle?: boolean;
  title?: string;
  propertyPath?: string;
  hidden?: boolean;
  active?: boolean;
  inactive?: boolean;
  show?: boolean;
  nowrap?: boolean;
  cssClass?: string;
  kind?: TableColumnKind;
  template?: string;
  pipeList?: Array<TableColumnPipe | string>;
  importList?: TypeImport[];
  filterControl?: BaseFormControl;
}

export type NormalizedTableColumnPipe = NormalizedTypeImport;

export interface NormalizedTableColumn extends Omit<Readonly<Normalized<TableColumn>>, 'pipeList' | 'importList'> {
  type: NormalizedTypeImport;
  propertyPath: string;
  pipeList: ReadonlyArray<NormalizedTableColumnPipe>;
  modifiers: TableColumnModifier[];
  importList: ReadonlyArray<NormalizedTypeImport>;
  kind: TableColumnKind;
  handlebars: Handlebars.TemplateDelegate<{ column: NormalizedTableColumn }>,
}

export function NormalizeTableColumnPipe(pipe: string | TableColumnPipe): NormalizedTableColumnPipe {
  if (typeof pipe === 'string') {
    switch (pipe) {
      case 'async':
        return NormalizeTypeImport({
          name: 'async',
          namedImport: 'AsyncPipe',
          moduleSpecifier: '@angular/common',
        });
      case 'date':
        return NormalizeTypeImport({
          name: 'date',
          namedImport: 'DatePipe',
          moduleSpecifier: '@angular/common',
        });
      case 'json':
        return NormalizeTypeImport({
          name: 'json',
          namedImport: 'JsonPipe',
          moduleSpecifier: '@angular/common',
        });
      case 'keyvalue':
        return NormalizeTypeImport({
          name: 'keyvalue',
          namedImport: 'KeyValuePipe',
          moduleSpecifier: '@angular/common',
        });
      default:
        throw new Error(`Unknown pipe ${ pipe }`);
    }
  }
  return NormalizeTypeImport(pipe);
}

function coerceTableColumnImportList(column: Readonly<TableColumn>): TypeImport[] {
  const importList = column.importList ?? [];
  switch (column.kind) {
    case TableColumnKind.COMPONENT:
      CoerceArrayItems(importList, [
        {
          name: `${ classify(column.name) }CellComponent`,
          moduleSpecifier: `./${ dasherize(column.name) }-cell/${ dasherize(column.name) }-cell.component`,
        },
      ], (a, b) => a.name === b.name);
      break;
    case TableColumnKind.ICON:
      CoerceArrayItems(importList, [
        {
          name: 'IconCellComponent',
          moduleSpecifier: '@rxap/material-table-system',
        },
      ], (a, b) => a.name === b.name);
      break;
    case TableColumnKind.LINK:
      CoerceArrayItems(importList, [
        {
          name: 'LinkCellComponent',
          moduleSpecifier: '@rxap/material-table-system',
        },
      ], (a, b) => a.name === b.name);
      break;
    case TableColumnKind.DATE:
      CoerceArrayItems(importList, [
        {
          name: 'DateCellComponent',
          moduleSpecifier: '@rxap/material-table-system',
        },
      ], (a, b) => a.name === b.name);
      break;
    case TableColumnKind.BOOLEAN:
      CoerceArrayItems(importList, [
        {
          name: 'BooleanCellComponent',
          moduleSpecifier: '@rxap/material-table-system',
        },
      ], (a, b) => a.name === b.name);
      break;
    case TableColumnKind.COPY_TO_CLIPBOARD:
      CoerceArrayItems(importList, [
        {
          name: 'CopyToClipboardCellComponent',
          moduleSpecifier: '@rxap/material-table-system',
        },
      ], (a, b) => a.name === b.name);
      break;
  }
  if (column.hasFilter) {
    switch (column.kind) {
      case TableColumnKind.BOOLEAN:
        CoerceArrayItems(importList, [
          {
            name: 'MatCheckboxModule',
            moduleSpecifier: '@angular/material/checkbox',
          },
          {
            name: 'ReactiveFormsModule',
            moduleSpecifier: '@angular/forms',
          },
          {
            name: 'ParentControlContainerDirective',
            moduleSpecifier: '@rxap/forms',
          },
        ], (a, b) => a.name === b.name);
        break;
      default:
        CoerceArrayItems(importList, [
          {
            name: 'MatInputModule',
            moduleSpecifier: '@angular/material/input',
          },
          {
            name: 'MatButtonModule',
            moduleSpecifier: '@angular/material/button',
          },
          {
            name: 'MatIconModule',
            moduleSpecifier: '@angular/material/icon',
          },
          {
            name: 'InputClearButtonDirective',
            moduleSpecifier: '@rxap/material-form-system',
          },
          {
            name: 'ReactiveFormsModule',
            moduleSpecifier: '@angular/forms',
          },
          {
            name: 'ParentControlContainerDirective',
            moduleSpecifier: '@rxap/forms',
          },
        ], (a, b) => a.name === b.name);
        break;
    }
  }
  return importList;
}

function guessTyoe(kind: TableColumnKind, type?: string | TypeImport): string | TypeImport {
  const autoType = type ? typeof type === 'string' ? type : type.name : null;
  if (!autoType || autoType === 'unknown') {
    switch (kind) {
      case TableColumnKind.DATE:
        type = 'number | Date';
        break;
      case TableColumnKind.LINK:
        type = 'string';
        break;
      case TableColumnKind.ICON:
        // TODO : use the IconConfig type
        type = {
          name: 'IconConfig',
          moduleSpecifier: '@rxap/utilities',
        };
        break;
      case TableColumnKind.BOOLEAN:
        type = 'boolean';
        break;
    }
  }
  type ??= 'unknown';
  return type;
}

export function NormalizeTableColumn(
  column: Readonly<TableColumn>,
): NormalizedTableColumn {
  let name: string;
  let modifiers: string[] = [];
  let hasFilter = false;
  let title: string | null = null;
  let propertyPath: string | null = null;
  let hidden = false;
  let active = false;
  let inactive = false;
  let show = false;
  let nowrap = false;
  let withoutTitle = false;
  let cssClass: string | null = null;
  let kind: string = TableColumnKind.DEFAULT;
  let template: string | null = null;
  let pipeList: Array<string | TableColumnPipe> = [];
  let importList: TypeImport[] = [];
  name = column.name;
  modifiers = column.modifiers ?? [];
  hasFilter = column.hasFilter ?? false;
  title = column.title ?? title;
  propertyPath = column.propertyPath ?? propertyPath;
  hidden = column.hidden ?? false;
  active = column.active ?? false;
  inactive = column.inactive ?? false;
  show = column.show ?? false;
  nowrap = column.nowrap ?? false;
  withoutTitle = column.withoutTitle ?? false;
  cssClass = column.cssClass ?? cssClass;
  kind = column.kind ?? kind;
  template = column.template ?? kind + '-table-column.hbs';
  pipeList = column.pipeList ?? pipeList;
  importList = coerceTableColumnImportList(column);
  const namePrefix = name.match(/^(_+)/)?.[1] ?? '';
  propertyPath ??= name
    .replace(/\?\./g, '.')
    .split('.')
    .map((part) => camelize(part))
    .join('?.');
  name = dasherize(name.replace(/\??\./g, '_'));
  if (namePrefix) {
    name = namePrefix + name;
    propertyPath = namePrefix + propertyPath;
  }
  title ??= dasherize(name)
    .replace(/_/g, '-')
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
  hasFilter = modifiers.includes(TableColumnModifier.FILTER) || hasFilter;
  active = modifiers.includes(TableColumnModifier.ACTIVE) || active;
  inactive = modifiers.includes(TableColumnModifier.INACTIVE) || inactive;
  show = modifiers.includes(TableColumnModifier.SHOW) || show;
  hidden = modifiers.includes(TableColumnModifier.HIDDEN) || hidden;
  nowrap = modifiers.includes(TableColumnModifier.NOWRAP) || nowrap;
  withoutTitle = modifiers.includes(TableColumnModifier.WITHOUT_TITLE) || modifiers.includes(TableColumnModifier.NO_TITLE) || withoutTitle;
  if (nowrap) {
    if (!cssClass) {
      cssClass = 'nowrap';
    } else {
      cssClass += ' nowrap';
    }
  }
  if (!modifiers.every(IsTableColumnModifier)) {
    throw new Error(`Unknown modifier in column ${ name } - [ ${ modifiers.join(', ') } ]`);
  }
  if (!IsTableColumnKind(kind)) {
    throw new Error(`Unknown kind in column ${ name } - ${ kind }`);
  }

  const type = guessTyoe(kind, column.type);

  let filterControl: BaseFormControl | null = column.filterControl ?? null;
  if (Object.keys(filterControl ?? {}).length === 0) {
    filterControl = null;
  }
  if (hasFilter && !filterControl) {
    filterControl = { name: column.name, kind: FormControlKinds.DEFAULT };
  }
  if (filterControl && !hasFilter) {
    hasFilter = true;
  }
  return Object.freeze({
    kind,
    name,
    type: NormalizeTypeImport(type),
    modifiers,
    hasFilter,
    title,
    propertyPath,
    hidden,
    active,
    inactive,
    show,
    nowrap,
    withoutTitle,
    cssClass,
    pipeList: pipeList.map(NormalizeTableColumnPipe),
    template,
    importList: importList.map(NormalizeTypeImport),
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'table', 'templates')),
    filterControl: filterControl ? NormalizeFormDefinitionControl(filterControl) : null,
  });
}

export function NormalizeTableColumnList(
  columnList?: ReadonlyArray<Readonly<TableColumn>>,
): ReadonlyArray<NormalizedTableColumn> {
  return Object.freeze(columnList?.map(NormalizeTableColumn) ?? []);
}
