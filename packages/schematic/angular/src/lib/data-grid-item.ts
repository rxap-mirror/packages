import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  NormalizeTypeImportList,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import { __decorate } from 'tslib';
import { DataGridAccordionItem } from './accordion-item';
import { DataGridMode } from './data-grid-mode';
import { NormalizedBaseFormControl } from './form-control';
import {
  FormDefinitionControl,
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from './form-definition-control';
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

export interface BaseDataGridItem {
  name: string;
  header?: string;
  pipeList?: Array<string | TypeImport>;
  formControl?: Omit<FormDefinitionControl, 'name'> & { name?: string };
  importList?: TypeImport[];
  hasCellDef?: boolean;
  kind?: DataGridKinds;
  template?: string;
}

export interface NormalizedBaseDataGridItem extends Omit<Readonly<Normalized<BaseDataGridItem>>, 'importList' | 'pipeList'> {
  hasCellDef: boolean;
  hasHeaderCellDef: boolean;
  hasEditCellDef: boolean;
  kind: DataGridKinds;
  formControl: NormalizedFormDefinitionControl | null;
  importList: ReadonlyArray<NormalizedTypeImport>;
  pipeList: ReadonlyArray<NormalizedPipeOption>;
  template: string;
  handlebars: Handlebars.TemplateDelegate<{ item: NormalizedBaseDataGridItem }>;
}

export function NormalizeBaseDataGridItem(item: Readonly<BaseDataGridItem>): NormalizedBaseDataGridItem {
  const formControl = item.formControl && Object.keys(item.formControl).length ? NormalizeFormDefinitionControl({
    name: item.name,
    ...item.formControl,
  }) : null;

  let hasCellDef = item.hasCellDef ?? false;
  let hasHeaderCellDef = false;
  let hasEditCellDef = false;

  if (item.header) {
    hasHeaderCellDef = true;
  }
  if (item.pipeList?.length) {
    hasCellDef = true;
  }
  if (formControl) {
    hasEditCellDef = true;
  }
  if (!hasCellDef && !hasEditCellDef) {
    hasCellDef = true;
  }
  const importList = item.importList ?? [];
  const pipeList = NormalizePipeOptionList(item.pipeList);
  CoerceArrayItems(importList, pipeList.map(PipeOptionToTypeImport), (a, b) => a.name === b.name && a.namedImport === b.namedImport);
  const kind = item.kind ?? DataGridKinds.DEFAULT;
  const template = item.template ?? kind + '-data-grid-item.hbs';
  return Object.freeze({
    template,
    kind,
    handlebars: LoadHandlebarsTemplate(template, join(__dirname, '..', 'schematics', 'data-grid-component', 'templates')),
    formControl,
    name: item.name,
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
  importList.push(
    {
    name: 'MatButtonModule',
    moduleSpecifier: '@angular/material/button',
  },
    {
      name: 'MatIconModule',
      moduleSpecifier: '@angular/material/icon',
    },
  );
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
