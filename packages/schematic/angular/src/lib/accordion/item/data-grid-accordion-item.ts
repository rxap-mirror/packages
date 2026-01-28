import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import { BackendOptions } from '../../backend/backend-options';
import {
  BaseAccordionItem,
  NormalizeBaseAccordionItem,
  NormalizedBaseAccordionItem,
} from './base-accordion-item';
import {
  DataGridOptions,
  NormalizeDataGridOptions,
  NormalizedDataGridOptions,
} from '../../data-grid-options';
import { AccordionItemKinds } from '../accordion-item-kind';

export interface DataGridAccordionItem extends BaseAccordionItem {
  dataGrid: DataGridOptions;
}

export function IsDataGridAccordionItem(item: BaseAccordionItem): item is DataGridAccordionItem {
  return item.kind === AccordionItemKinds.DataGrid;
}

export interface NormalizedDataGridAccordionItem extends Readonly<Normalized<Omit<DataGridAccordionItem, keyof BaseAccordionItem | 'dataGrid'>> & NormalizedBaseAccordionItem> {
  kind: AccordionItemKinds.DataGrid;
  dataGrid: NormalizedDataGridOptions;
}

export function IsNormalizedDataGridAccordionItem(item: NormalizedBaseAccordionItem): item is NormalizedDataGridAccordionItem {
  return item.kind === AccordionItemKinds.DataGrid;
}

export function NormalizeDataGridAccordionItem(item: DataGridAccordionItem, backend: BackendOptions): NormalizedDataGridAccordionItem {
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
    kind: AccordionItemKinds.DataGrid,
    dataGrid: NormalizeDataGridOptions(dataGrid, backend),
  });
}
