import { SchematicsException } from '@angular-devkit/schematics';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizedUpstreamOptions,
  NormalizeTypeImportList,
  NormalizeUpstreamOptions,
  TypeImport,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  capitalize,
  classify,
  CoerceArrayItems,
  CoercePrefix,
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import Handlebars from 'handlebars';
import { join } from 'path';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from './accordion-identifier';
import {
  AccordionItemKinds,
  IsAccordionItemKind,
} from './accordion-itme-kinds';
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
  kind: AccordionItemKinds;
  modifiers: string[];
  title: string;
  description?: string;
  permission?: string;
  importList?: TypeImport[];
  template?: string;
  identifier?: AccordionIdentifier;
  upstream?: UpstreamOptions;
  propertyList?: DataProperty[];
}

export interface NormalizedBaseAccordionItem extends Readonly<NonNullableSelected<Normalized<Omit<BaseAccordionItem, 'propertyList'>>, 'kind'>> {
  importList: NormalizedTypeImport[];
  handlebars: Handlebars.TemplateDelegate<{ item: NormalizedBaseAccordionItem }>,
  identifier: NormalizedAccordionIdentifier | null;
  upstream: NormalizedUpstreamOptions | null;
  propertyList: Array<NormalizedDataProperty>;
}

export function NormalizeBaseAccordionItem(item: BaseAccordionItem): NormalizedBaseAccordionItem {
  let kind = AccordionItemKinds.Default;
  let modifiers: string[] = [];
  let title: string;
  let description: string | null = null;
  let permission: string | null = null;
  const name = item.name;
  kind = item.kind ?? kind;
  const template = item.template ?? kind + '-accordion-item.hbs';
  modifiers = item.modifiers ?? modifiers;
  title = item.title;
  description = item.description ?? description;
  permission = item.permission ?? permission;
  const importList: TypeImport[] = item.importList ?? [];
  CoerceArrayItems(importList, [{
    name: `${classify(item.name)}PanelComponent`,
    moduleSpecifier: `./${dasherize(item.name)}-panel/${dasherize(item.name)}-panel.component`
  }], (a, b) => a.name === b.name);
  title ??= dasherize(name).split('-').map(fragment => capitalize(fragment)).join(' ');
  if (!IsAccordionItemKind(kind)) {
    throw new SchematicsException(
      `The item type '${ kind }' for item '${ name }' is not supported`,
    );
  }
  const propertyList = item.propertyList ?? [];
  const identifier = NormalizeAccordionIdentifier(item.identifier);
  if (identifier) {
    CoerceArrayItems(propertyList, [identifier.property], (a, b) => a.name === b.name, true);
  }
  return Object.freeze({
    propertyList: NormalizeDataPropertyList(propertyList),
    upstream: NormalizeUpstreamOptions(item.upstream),
    identifier,
    title,
    description,
    name: dasherize(name),
    kind,
    modifiers,
    permission,
    importList: NormalizeTypeImportList(importList),
    template,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'accordion', 'templates')),
  });
}

// endregion

// region data-grid

export interface DataGridAccordionItem extends BaseAccordionItem {
  type: AccordionItemKinds.DataGrid;
  dataGrid: DataGridOptions;
}

export function IsDataGridAccordionItem(item: BaseAccordionItem): item is DataGridAccordionItem {
  return item.kind === AccordionItemKinds.DataGrid;
}

export interface NormalizedDataGridAccordionItem extends Readonly<Normalized<Omit<DataGridAccordionItem, 'dataGrid' | 'propertyList'>> & NormalizedBaseAccordionItem> {
  dataGrid: NormalizedDataGridOptions;
}

export function IsNormalizedDataGridAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedDataGridAccordionItem {
  return item.kind === AccordionItemKinds.DataGrid;
}

export function NormalizeDataGridAccordionItem(item: DataGridAccordionItem): NormalizedDataGridAccordionItem {
  const dataGrid = item.dataGrid;
  const base = NormalizeBaseAccordionItem(item);
  dataGrid.propertyList ??= [];
  CoerceArrayItems(dataGrid.propertyList, base.propertyList, {
    compareTo: (a, b) => a.name === b.name,
    replace: true,
  });
  dataGrid.inCard ??= false;
  return Object.freeze({
    ...base,
    type: AccordionItemKinds.DataGrid,
    dataGrid: NormalizeDataGridOptions(dataGrid),
  });
}

// endregion

// region switch

export interface SwitchAccordionItem extends BaseAccordionItem {
  type: AccordionItemKinds.Switch;
  switch: {
    property: DataProperty;
    case?: Array<{
      test: string;
      itemList: Array<Omit<BaseAccordionItem, 'type'> & Partial<BaseAccordionItem>>
    }>;
    defaultCase?: {
      itemList: Array<Omit<BaseAccordionItem, 'type'> & Partial<BaseAccordionItem>>
    }
  }
}

export function IsSwitchAccordionItem(item: BaseAccordionItem): item is SwitchAccordionItem {
  return item.kind === AccordionItemKinds.Switch;
}

export interface NormalizedSwitchAccordionItem extends Readonly<Normalized<Omit<SwitchAccordionItem, 'switch' | 'propertyList'>> & NormalizedBaseAccordionItem> {
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
  return item.kind === AccordionItemKinds.Switch;
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
  const { property, case: caseList = [], defaultCase } = switchOptions;
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
  if (normalizeSwitch.case.length === 0 && !normalizeSwitch.defaultCase) {
    throw new SchematicsException(
      `The switch '${ name }' has no cases or default case. At least one case or default case is required.`,
    );
  }
  const importList: TypeImport[] = item.importList ?? [];
  const itemList = flattenItemListFromSwitch(normalizeSwitch);
  for (const innerItem of itemList) {
    CoerceArrayItems(importList, innerItem.importList, (a, b) => a.name === b.name);
  }
  CoerceArrayItems(importList, [{
    name: 'NgSwitch',
    moduleSpecifier: '@angular/common',
  }], (a, b) => a.name === b.name);
  if (normalizeSwitch.defaultCase) {
    CoerceArrayItems(importList, [{
      name: 'NgSwitchDefault',
      moduleSpecifier: '@angular/common',
    }], (a, b) => a.name === b.name);
  }
  if (normalizeSwitch.case.length) {
    CoerceArrayItems(importList, [{
      name: 'NgSwitchCase',
      moduleSpecifier: '@angular/common',
    }], (a, b) => a.name === b.name);
  }
  return Object.freeze({
    ...base,
    importList: NormalizeTypeImportList(importList),
    type: AccordionItemKinds.Switch,
    switch: normalizeSwitch,
  });
}

// endregion

// region table

export interface TableAccordionItem extends BaseAccordionItem {
  type: AccordionItemKinds.Table;
  table: TableOptions;
}

export function IsTableAccordionItem(item: BaseAccordionItem): item is TableAccordionItem {
  return item.kind === AccordionItemKinds.Table;
}

export interface NormalizedTableAccordionItem extends Readonly<Normalized<Omit<TableAccordionItem, 'table' | 'propertyList'>> & NormalizedBaseAccordionItem> {
  table: NormalizedTableOptions;
}

export function IsNormalizedTableAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedTableAccordionItem {
  return item.kind === AccordionItemKinds.Table;
}

export function NormalizeTableAccordionItem(item: TableAccordionItem): NormalizedTableAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  return Object.freeze({
    ...base,
    type: AccordionItemKinds.Table,
    table: NormalizeTableOptions(item.table, name),
  });
}

// endregion

// region tree-table

export interface TreeTableAccordionItem extends BaseAccordionItem {
  type: AccordionItemKinds.TreeTable;
  table: TreeTableOptions;
}

export function IsTreeTableAccordionItem(item: BaseAccordionItem): item is TreeTableAccordionItem {
  return item.kind === AccordionItemKinds.TreeTable;
}

export interface NormalizedTreeTableAccordionItem extends Readonly<Normalized<Omit<TreeTableAccordionItem, 'table' | 'propertyList'>> & NormalizedBaseAccordionItem> {
  table: NormalizedTreeTableOptions;
}

export function IsNormalizedTreeTableAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedTreeTableAccordionItem {
  return item.kind === AccordionItemKinds.TreeTable;
}

export function NormalizeTreeTableAccordionItem(item: TreeTableAccordionItem): NormalizedTreeTableAccordionItem {
  const base = NormalizeBaseAccordionItem(item);
  const { name } = base;
  return Object.freeze({
    ...base,
    type: AccordionItemKinds.TreeTable,
    table: NormalizeTreeTableOptions(item.table, name),
  });

}

// endregion

export function NormalizeAccordionItem(item: BaseAccordionItem): NormalizedBaseAccordionItem {
  switch (item.kind) {
    case AccordionItemKinds.DataGrid:
      return NormalizeDataGridAccordionItem(item as DataGridAccordionItem);
    case AccordionItemKinds.Switch:
      return NormalizeSwitchAccordionItem(item as SwitchAccordionItem);
    case AccordionItemKinds.Table:
      return NormalizeTableAccordionItem(item as TableAccordionItem);
    case AccordionItemKinds.TreeTable:
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
