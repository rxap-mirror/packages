import { SchematicsException } from '@angular-devkit/schematics';
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  NormalizedTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  Control,
  NormalizeControl,
  NormalizedControl,
} from './form/control';
import { LoadHandlebarsTemplate } from './load-handlebars-template';
import {
  NormalizedPipeOption,
  NormalizePipeOptionList,
  PipeOptionToTypeImport,
} from './pipe-option';

export enum DataGridKinds {
  DEFAULT = 'default',
  LINK = 'link',
}

export type DataGridItem = BaseDataGridItem | LinkDataGridItem;
export type NormalizedDataGridItem = NormalizedBaseDataGridItem | NormalizedLinkDataGridItem;

// region BaseDataGridItem

export interface BaseDataGridItem extends DataProperty {
  header?: string;
  pipeList?: Array<string | TypeImport>;
  formControl?: Omit<Control, 'name'> & { name?: string };
  importList?: TypeImport[];
  hasCellDef?: boolean;
  hasHeaderCellDef?: boolean;
  hasEditCellDef?: boolean;
  kind?: DataGridKinds;
  template?: string;
}

export interface NormalizedBaseDataGridItem extends Readonly<Normalized<Omit<BaseDataGridItem, 'importList' | 'pipeList'>> & NormalizedDataProperty> {
  hasCellDef: boolean;
  hasHeaderCellDef: boolean;
  hasEditCellDef: boolean;
  kind: DataGridKinds;
  formControl: NormalizedControl | null;
  importList: ReadonlyArray<NormalizedTypeImport>;
  pipeList: ReadonlyArray<NormalizedPipeOption>;
  template: string;
  handlebars: Handlebars.TemplateDelegate<{ item: NormalizedBaseDataGridItem }>;
}

export function NormalizeBaseDataGridItem(item: Readonly<BaseDataGridItem>): NormalizedBaseDataGridItem {
  if (!item.name) {
    throw new SchematicsException('The data grid item is required');
  }
  const formControl = item.formControl && Object.keys(item.formControl).length ? NormalizeControl({
    name: item.name,
    ...item.formControl,
  }) : null;

  let hasCellDef = item.hasCellDef ?? false;
  let hasHeaderCellDef = item.hasHeaderCellDef ?? false;
  let hasEditCellDef = item.hasEditCellDef ?? false;

  // if the hasHeaderCellDef is explicitly set to false then don't try to set it to true
  if (item.header && item.hasHeaderCellDef !== false) {
    hasHeaderCellDef = true;
  }
  // if the hasCellDef is explicitly set to false then don't try to set it to true
  if (item.pipeList?.length && item.hasCellDef !== false) {
    hasCellDef = true;
  }
  // if the hasEditCellDef is explicitly set to false then don't try to set it to true
  if (formControl && item.hasEditCellDef !== false) {
    hasEditCellDef = true;
  }
  // if the hasCellDef is explicitly set to false then don't try to set it to true
  if (!hasCellDef && !hasEditCellDef && item.hasCellDef !== false) {
    hasCellDef = true;
  }
  const importList = item.importList ?? [];
  const pipeList = NormalizePipeOptionList(item.pipeList);
  CoerceArrayItems(importList, pipeList.map(PipeOptionToTypeImport), (a, b) => a.name === b.name && a.namedImport === b.namedImport);
  if (formControl) {
    CoerceArrayItems(importList, formControl.importList, (a, b) => a.name === b.name && a.namedImport === b.namedImport);
  }
  const kind = item.kind ?? DataGridKinds.DEFAULT;
  const template = item.template ?? kind + '-data-grid-item.hbs';
  console.log('DATA_GRID', JSON.stringify({ name: item.name, formControl: formControl?.type, source: item.formControl?.type }));
  const type = formControl?.type ?? item.type;
  return Object.freeze({
    ...NormalizeDataProperty({
      ...item,
      type,
    }),
    template,
    kind,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'data-grid-component', 'templates')),
    formControl,
    header: item.header ?? null,
    pipeList,
    hasCellDef,
    hasHeaderCellDef,
    hasEditCellDef,
    importList: NormalizeTypeImportList(importList),
  });
}

// endregion

// region LinkDataGridItem

export interface LinkDataGridItem extends BaseDataGridItem {
  kind: DataGridKinds.LINK;
  target?: string;
}

export interface NormalizedLinkDataGridItem extends NormalizedBaseDataGridItem {
  kind: DataGridKinds.LINK;
  target: string;
}

export function IsLinkDataGridItem(item: Readonly<DataGridItem>): item is Readonly<LinkDataGridItem> {
  return item.kind === DataGridKinds.LINK;
}

export function IsNormalLinkDataGridItem(item: Readonly<NormalizedDataGridItem>): item is Readonly<NormalizedLinkDataGridItem> {
  return item.kind === DataGridKinds.LINK;
}

export function NormalizeLinkDataGridItem(item: Readonly<LinkDataGridItem>): Readonly<NormalizedLinkDataGridItem> {
  const importList = item.importList ?? [];
  CoerceArrayItems(importList, [
    {
    name: 'MatButtonModule',
    moduleSpecifier: '@angular/material/button',
  },
    {
      name: 'MatIconModule',
      moduleSpecifier: '@angular/material/icon',
    },
  ], (a, b) => a.name === b.name);
  return {
    ...NormalizeBaseDataGridItem({
      ...item,
      hasCellDef: true,
      importList,
    }),
    kind: DataGridKinds.LINK,
    target: item.target ?? '_self',
  };
}

export function NormalizeDataGridItem(
  item: Readonly<DataGridItem>,
): Readonly<NormalizedDataGridItem> {
  switch (item.kind) {
    case DataGridKinds.LINK:
      return NormalizeLinkDataGridItem(item as LinkDataGridItem);
    default:
    case DataGridKinds.DEFAULT:
      return NormalizeBaseDataGridItem(item);
  }
}

export function NormalizeDataGridItemList(
  itemList?: Array<Readonly<DataGridItem>>,
): ReadonlyArray<NormalizedDataGridItem> {
  return Object.freeze(itemList?.map(NormalizeDataGridItem) ?? []);
}
