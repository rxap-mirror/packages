import { SchematicsException } from '@angular-devkit/schematics';
import {
  capitalize,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  camelize,
  classify,
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import {
  CssClass,
  CssClassOptions,
  NormalizeCssClass,
  NormalizedCssClass,
} from './css-class';
import { AbstractControlRolls } from './form/abstract-control';
import {
  FormControl,
  NormalizedFormControl,
  NormalizeFormControl,
} from './form/control/form-control';
import { FormControlKinds } from './form/control/form-control-kind';
import { IsFormFieldFormControl } from './form/control/form-field-form-control';
import { IsInputFormControlOptions } from './form/control/input-form-control';
import { LoadHandlebarsTemplate } from './load-handlebars-template';
import {
  NormalizePipeOptionList,
  PipeOption,
} from './pipe-option';

export type TableColumnPipe = PipeOption;

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
  TREE = 'tree',
  SPINNER = 'spinner',
}

export function IsTableColumnKind(value: string): value is TableColumnKind {
  return Object.values(TableColumnKind).includes(value as TableColumnKind);
}

export enum TableColumnSticky {
  START = 'start',
  END = 'end',
}

export function IsTableColumnSticky(value: string): value is TableColumnSticky {
  return Object.values(TableColumnSticky).includes(value as TableColumnSticky);
}

export interface TableColumn extends DataProperty {
  modifiers?: string[];
  hasFilter?: boolean;
  withoutTitle?: boolean;
  title?: string;
  hidden?: boolean;
  active?: boolean;
  inactive?: boolean;
  show?: boolean;
  nowrap?: boolean;
  cssClass?: CssClass;
  kind?: TableColumnKind;
  template?: string;
  pipeList?: Array<TableColumnPipe | string>;
  importList?: TypeImport[];
  filterControl?: FormControl;
  sticky?: boolean | TableColumnSticky;
  synthetic?: boolean;
}

export type NormalizedTableColumnPipe = NormalizedTypeImport;

export interface NormalizedTableColumn extends Readonly<Normalized<Omit<TableColumn, 'pipeList' | 'importList' | 'filterControl'>> & NormalizedDataProperty> {
  type: NormalizedTypeImport;
  pipeList: ReadonlyArray<NormalizedTableColumnPipe>;
  modifiers: TableColumnModifier[];
  importList: ReadonlyArray<NormalizedTypeImport>;
  kind: TableColumnKind;
  handlebars: Handlebars.TemplateDelegate<{ column: NormalizedTableColumn }>,
  filterControl: NormalizedFormControl | null;
  cssClass: NormalizedCssClass;
  sticky: TableColumnSticky | null;
  stickyEnd: boolean;
  stickyStart: boolean;
  /**
   * the column name of the filter column matColumnDef
   */
  filterName: string;
  /**
   * use in the html template to define how the value is accessed from the element variable
   */
  propertyPath: string;
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

export function GuessColumnTypeType(kind: TableColumnKind, type?: string | TypeImport): string | TypeImport {
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

export function TableColumnNameToPropertyPath(name: string): string {
  const leadingUnderscoreCount = name.match(/^_*/)?.[0].length ?? 0;
  const nameWithoutLeadingUnderscores = name.slice(leadingUnderscoreCount);
  const propertyPath = nameWithoutLeadingUnderscores
    .replace(/\?\./g, '.')
    .split('.')
    .map((part) => camelize(part))
    .join('?.');
  return '_'.repeat(leadingUnderscoreCount) + propertyPath;
}

export function TableColumnNameToTitle(name: string) {
  return dasherize(name)
    .replace(/_/g, '-')
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}

export function NormalizeTableColumn(
  column: Readonly<TableColumn>,
): NormalizedTableColumn {
  if (!column.name) {
    throw new SchematicsException('The column name is required');
  }
  const modifiers = column.modifiers ?? [];
  const propertyPath = TableColumnNameToPropertyPath(column.name);
  let hasFilter = modifiers.includes(TableColumnModifier.FILTER) || (column.hasFilter ?? false);
  const title = column.title ?? TableColumnNameToTitle(column.name);
  const hidden = modifiers.includes(TableColumnModifier.HIDDEN) || (column.hidden ?? false);
  const active = modifiers.includes(TableColumnModifier.ACTIVE) || (column.active ?? false);
  const inactive = modifiers.includes(TableColumnModifier.INACTIVE) || (column.inactive ?? false);
  const show = modifiers.includes(TableColumnModifier.SHOW) || (column.show ?? false);
  const nowrap = modifiers.includes(TableColumnModifier.NOWRAP) || (column.nowrap ?? false);
  const withoutTitle = modifiers.includes(TableColumnModifier.WITHOUT_TITLE) || modifiers.includes(TableColumnModifier.NO_TITLE) || (column.withoutTitle ?? false);
  let cssClass = column.cssClass ?? null;
  const kind = column.kind ?? TableColumnKind.DEFAULT;
  const template = column.template ?? kind + '-table-column.hbs';
  const pipeList = column.pipeList ?? [];
  const importList = coerceTableColumnImportList(column);
  const type = GuessColumnTypeType(kind, column.type);
  const source = column.source ?? undefined;
  let sticky: TableColumnSticky | null = null;
  let stickyStart = false;
  let stickyEnd = false;
  const dataProperty = NormalizeDataProperty({
    ...column,
    type,
    source,
  });
  const { name } = dataProperty;
  if (column.sticky) {
    if (typeof column.sticky !== 'string' || !IsTableColumnSticky(column.sticky)) {
      sticky = TableColumnSticky.START;
    } else {
      sticky = column.sticky;
    }
    if (sticky === TableColumnSticky.START) {
      stickyStart = true;
    }
    if (sticky === TableColumnSticky.END) {
      stickyEnd = true;
    }
  }
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
  let filterControl: FormControl | null = column.filterControl ?? null;
  if (Object.keys(filterControl ?? {}).length === 0) {
    filterControl = null;
  }
  if (hasFilter && !filterControl) {
    filterControl = { name: column.name, kind: FormControlKinds.DEFAULT, role: AbstractControlRolls.CONTROL };
  }
  if (filterControl && !hasFilter) {
    hasFilter = true;
  }
  if (filterControl) {
    filterControl.label ??= title;
    filterControl.name ??= name;
    if (!filterControl.type || filterControl.type === 'unknown' || (typeof filterControl.type === 'object' && filterControl.type.name === 'unknown')) {
      filterControl.type = type ?? 'unknown';
    }
    if (IsInputFormControlOptions(filterControl)) {
      filterControl.placeholder ??= 'Enter filter';
    }
    if (IsFormFieldFormControl(filterControl)) {
      filterControl.formField ??= {};
      filterControl.formField.cssClass ??= [];
      if (Array.isArray(filterControl.formField.cssClass)) {
        if (!filterControl.formField.cssClass.some(item => {
          if (typeof item === 'string') {
            return item.includes('w-full');
          } else if (typeof item === 'object') {
            return item.name === 'w-full';
          }
          return false;
        })) {
          filterControl.formField.cssClass.push('w-full');
        }
      } else if (typeof filterControl.formField.cssClass === 'string') {
        if (!filterControl.formField.cssClass.includes('w-full')) {
          filterControl.formField.cssClass += ' w-full';
        }
        filterControl.formField.cssClass = filterControl.formField.cssClass.trim();
      } else if (typeof filterControl.formField.cssClass === 'object') {
        filterControl.formField.cssClass = [ filterControl.formField.cssClass ];
        CoerceArrayItems(filterControl.formField.cssClass as CssClassOptions[], [{
          name: 'w-full'
        }], (a, b) => a.name === b.name);
      }
    }
  }
  const normalizedFilterControl = filterControl ? NormalizeFormControl(filterControl) : null;
  if (normalizedFilterControl) {
    CoerceArrayItems(importList, normalizedFilterControl.importList, (a, b) => a.name === b.name);
  }
  return Object.freeze({
    ...dataProperty,
    synthetic: column.synthetic ?? false,
    filterName: `filter_${ name }`,
    propertyPath,
    sticky,
    stickyStart,
    stickyEnd,
    kind,
    modifiers,
    hasFilter,
    title,
    hidden,
    active,
    inactive,
    show,
    nowrap,
    withoutTitle,
    cssClass: NormalizeCssClass(cssClass),
    pipeList: NormalizePipeOptionList(pipeList),
    template,
    importList: NormalizeTypeImportList(importList),
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'table', 'templates')),
    filterControl: normalizedFilterControl,
  });
}

export function NormalizeTableColumnList(
  columnList?: ReadonlyArray<Readonly<TableColumn>>,
): ReadonlyArray<NormalizedTableColumn> {
  return Object.freeze(columnList?.map(NormalizeTableColumn) ?? []);
}
