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
import { DataGridAccordionItem } from './accordion-item';
import { DataGridMode } from './data-grid-mode';
import { NormalizedBaseFormControl } from './form-control';
import {
  FormDefinitionControl,
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from './form-definition-control';
import {
  NormalizedPipeOption,
  NormalizePipeOptionList,
  PipeOptionToTypeImport,
} from './pipe-option';

export interface DataGridItem {
  name: string;
  header?: string;
  pipeList?: Array<string | TypeImport>;
  formControl?: Omit<FormDefinitionControl, 'name'> & { name?: string };
  importList?: TypeImport[];
  hasCellDef?: boolean;
}

export interface NormalizedDataGridItem extends Omit<Readonly<Normalized<DataGridItem>>, 'importList' | 'pipeList'> {
  hasCellDef: boolean;
  hasHeaderCellDef: boolean;
  hasEditCellDef: boolean;
  formControl: NormalizedFormDefinitionControl | null;
  importList: ReadonlyArray<NormalizedTypeImport>;
  pipeList: ReadonlyArray<NormalizedPipeOption>;
}

export function NormalizeDataGridItem(item: Readonly<DataGridItem>): NormalizedDataGridItem {
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
  return Object.freeze({
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

export function NormalizeDataGridItemList(
  itemList?: Array<Readonly<DataGridItem>>,
): ReadonlyArray<NormalizedDataGridItem> {
  return Object.freeze(itemList?.map(NormalizeDataGridItem) ?? []);
}
