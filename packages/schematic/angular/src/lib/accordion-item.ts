import { SchematicsException } from '@angular-devkit/schematics';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  capitalize,
  classify,
  CoercePrefix,
  CoerceSuffix,
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import {
  AccordionItemTypes,
  IsAccordionItemType,
} from './accordion-itme-types';
import {
  DataGridOptions,
  NormalizeDataGridOptions,
  NormalizedDataGridOptions,
} from './data-grid-options';
import { LoadHandlebarsTemplate } from './load-handlebars-template';
import {
  NormalizedTableOptions,
  NormalizeTableOptions,
  TableOptions,
} from './table-options';
import {
  NormalizedTreeTableOptions,
  NormalizeTreeTableOptions,
  TreeTableOptions,
} from './tree-table-options';

// region base

export interface BaseAccordionItem {
  name: string;
  type: AccordionItemTypes;
  modifiers: string[];
  title: string;
  description?: string;
  permission?: string;
  importList?: TypeImport[];
  template?: string;
}

export interface NormalizedBaseAccordionItem extends Readonly<NonNullableSelected<Normalized<BaseAccordionItem>, 'type'>> {
  importList: NormalizedTypeImport[];
  handlebars: Handlebars.TemplateDelegate<{ item: NormalizedBaseAccordionItem }>,
}

export function NormalizeBaseAccordionItem(item: BaseAccordionItem): NormalizedBaseAccordionItem {
  let type = AccordionItemTypes.Default;
  let modifiers: string[] = [];
  let title: string;
  let description: string | null = null;
  let permission: string | null = null;
  const name = item.name;
  type = item.type ?? type;
  const template = item.template ?? type + '-accordion-item.hbs';
  modifiers = item.modifiers ?? modifiers;
  title = item.title;
  description = item.description ?? description;
  permission = item.permission ?? permission;
  const importList: TypeImport[] = item.importList ?? [];
  importList.push({
    name: `${classify(item.name)}PanelComponent`,
    moduleSpecifier: `./${dasherize(item.name)}-panel/${dasherize(item.name)}-panel.component`
  });
  title ??= dasherize(name).split('-').map(fragment => capitalize(fragment)).join(' ');
  if (!IsAccordionItemType(type)) {
    throw new SchematicsException(
      `The item type '${ type }' for item '${ name }' is not supported`,
    );
  }
  return Object.freeze({
    title,
    description,
    name: dasherize(name),
    type,
    modifiers,
    permission,
    importList: importList.map(NormalizeTypeImport),
    template,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'accordion', 'templates')),
  });
}

// endregion

// region data-grid

export interface DataGridAccordionItem extends BaseAccordionItem {
  type: AccordionItemTypes.DataGrid;
  dataGrid: DataGridOptions;
}

export function IsDataGridAccordionItem(item: BaseAccordionItem): item is DataGridAccordionItem {
  return item.type === AccordionItemTypes.DataGrid;
}

export interface NormalizedDataGridAccordionItem extends Readonly<Normalized<Omit<DataGridAccordionItem, 'dataGrid'>> & NormalizedBaseAccordionItem> {
  dataGrid: NormalizedDataGridOptions;
}

export function IsNormalizedDataGridAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedDataGridAccordionItem {
  return item.type === AccordionItemTypes.DataGrid;
}

export function NormalizeDataGridAccordionItem(item: DataGridAccordionItem): NormalizedDataGridAccordionItem {
  return Object.freeze({
    ...NormalizeBaseAccordionItem(item),
    type: AccordionItemTypes.DataGrid,
    dataGrid: NormalizeDataGridOptions(item.dataGrid),
  });
}

// endregion

// region switch

export interface SwitchAccordionItem extends BaseAccordionItem {
  type: AccordionItemTypes.Switch;
  switch: {
    property: DataProperty;
    case: Array<{
      test: string;
      itemList: Array<Omit<BaseAccordionItem, 'type'> & Partial<BaseAccordionItem>>
    }>;
    defaultCase?: {
      itemList: Array<Omit<BaseAccordionItem, 'type'> & Partial<BaseAccordionItem>>
    }
  }
}

export function IsSwitchAccordionItem(item: BaseAccordionItem): item is SwitchAccordionItem {
  return item.type === AccordionItemTypes.Switch;
}

export interface NormalizedSwitchAccordionItem extends Readonly<Normalized<Omit<SwitchAccordionItem, 'switch'>> & NormalizedBaseAccordionItem> {
  switch: Readonly<{
    property: NormalizedDataProperty;
    case: ReadonlyArray<{
      test: string;
      itemList: ReadonlyArray<NormalizedBaseAccordionItem>
    }>;
    defaultCase: Readonly<{
      itemList: ReadonlyArray<NormalizedBaseAccordionItem>
    }> | null;
  }>;
}

export function IsNormalizedSwitchAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedSwitchAccordionItem {
  return item.type === AccordionItemTypes.Switch;
}

function flattenItemList(itemList: ReadonlyArray<NormalizedBaseAccordionItem>): NormalizedBaseAccordionItem[] {
  let flattenedList: NormalizedBaseAccordionItem[] = [];

  itemList.forEach(item => {
    flattenedList.push(item);

    if (IsNormalizedSwitchAccordionItem(item) && item.switch) {
      const { case: caseList, defaultCase } = item.switch;
      caseList.forEach(caseItem => {
        flattenedList = flattenedList.concat(flattenItemList(caseItem.itemList));
      });

      if (defaultCase) {
        flattenedList = flattenedList.concat(flattenItemList(defaultCase.itemList));
      }
    }
  });

  return flattenedList;
}

function flattenItemListFromSwitch(normalizeSwitch: NormalizedSwitchAccordionItem['switch']): NormalizedBaseAccordionItem[] {
  let flattenedList: NormalizedBaseAccordionItem[] = [];
  const { case: caseList, defaultCase } = normalizeSwitch;
  caseList.forEach(caseItem => {
    flattenedList = flattenedList.concat(flattenItemList(caseItem.itemList));
  });

  if (defaultCase) {
    flattenedList = flattenedList.concat(flattenItemList(defaultCase.itemList));
  }

  return flattenedList;
}

export function NormalizeSwitchAccordionItem(item: Readonly<SwitchAccordionItem>): NormalizedSwitchAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  const { switch: switchOptions } = item;
  const { property, case: caseList, defaultCase } = switchOptions;
  const normalizedProperty = NormalizeDataProperty(property, 'string');
  const normalizeSwitch = Object.freeze({
      property: normalizedProperty,
      case: Object.freeze(caseList.map((item) => ({
        test: normalizedProperty.name === 'string' ? `'${item.test}'` : item.test,
        itemList: NormalizeAccordionItemList(item.itemList.map((item) => ({
          ...item,
          name: CoercePrefix(dasherize(item.name), dasherize(name) + '-'),
        }) as BaseAccordionItem)),
      }))),
      defaultCase: defaultCase && Object.keys(defaultCase).length ? {
        itemList: NormalizeAccordionItemList(defaultCase.itemList.map((item) => ({
          ...item,
          name: CoercePrefix(dasherize(item.name), dasherize(name) + '-'),
        }) as BaseAccordionItem)),
      } : null,
    });
  const importList: TypeImport[] = item.importList ?? [];
  const itemList = flattenItemListFromSwitch(normalizeSwitch);
  for (const innerItem of itemList) {
    importList.push(...innerItem.importList);
  }
  importList.push({
    name: 'NgSwitch',
    moduleSpecifier: '@angular/common',
  });
  return Object.freeze({
    ...base,
    importList: importList.map(NormalizeTypeImport),
    type: AccordionItemTypes.Switch,
    switch: normalizeSwitch,
  });
}

// endregion

// region table

export interface TableAccordionItem extends BaseAccordionItem {
  type: AccordionItemTypes.Table;
  table: TableOptions;
}

export function IsTableAccordionItem(item: BaseAccordionItem): item is TableAccordionItem {
  return item.type === AccordionItemTypes.Table;
}

export interface NormalizedTableAccordionItem extends Readonly<Normalized<Omit<TableAccordionItem, 'table'>> & NormalizedBaseAccordionItem> {
  table: NormalizedTableOptions;
}

export function IsNormalizedTableAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedTableAccordionItem {
  return item.type === AccordionItemTypes.Table;
}

export function NormalizeTableAccordionItem(item: TableAccordionItem): NormalizedTableAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  return Object.freeze({
    ...base,
    type: AccordionItemTypes.Table,
    table: NormalizeTableOptions(item.table, name),
  });
}

// endregion

// region tree-table

export interface TreeTableAccordionItem extends BaseAccordionItem {
  type: AccordionItemTypes.TreeTable;
  table: TreeTableOptions;
}

export function IsTreeTableAccordionItem(item: BaseAccordionItem): item is TreeTableAccordionItem {
  return item.type === AccordionItemTypes.TreeTable;
}

export interface NormalizedTreeTableAccordionItem extends Readonly<Normalized<Omit<TreeTableAccordionItem, 'table'>> & NormalizedBaseAccordionItem> {
  table: NormalizedTreeTableOptions;
}

export function IsNormalizedTreeTableAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedTreeTableAccordionItem {
  return item.type === AccordionItemTypes.TreeTable;
}

export function NormalizeTreeTableAccordionItem(item: TreeTableAccordionItem): NormalizedTreeTableAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  return Object.freeze({
    ...base,
    type: AccordionItemTypes.TreeTable,
    table: NormalizeTreeTableOptions(item.table, name),
  });

}

// endregion

export function NormalizeAccordionItem(item: BaseAccordionItem): NormalizedBaseAccordionItem {
  switch (item.type) {
    case AccordionItemTypes.DataGrid:
      return NormalizeDataGridAccordionItem(item as DataGridAccordionItem);
    case AccordionItemTypes.Switch:
      return NormalizeSwitchAccordionItem(item as SwitchAccordionItem);
    case AccordionItemTypes.Table:
      return NormalizeTableAccordionItem(item as TableAccordionItem);
    case AccordionItemTypes.TreeTable:
      return NormalizeTreeTableAccordionItem(item as TreeTableAccordionItem);
    default:
      return NormalizeBaseAccordionItem(item);
  }
}

export function NormalizeAccordionItemList(itemList?: Array<BaseAccordionItem>): ReadonlyArray<NormalizedBaseAccordionItem> {
  return Object.freeze((
    itemList ?? []
  ).map(NormalizeAccordionItem));
}
