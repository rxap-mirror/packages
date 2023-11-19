import { Normalized } from '@rxap/utilities';
import {
  DataGridItem,
  NormalizeDataGridItemList,
  NormalizedDataGridItem,
} from './data-grid-item';

export enum DataGridMode {
  Form = 'form',
  Plain = 'plain',
}

function IsDataGridMode(value: any): value is DataGridMode {
  return Object.values(DataGridMode).includes(value);
}

export interface DataGridOptions {
  itemList?: Array<string | DataGridItem>;
  mode?: DataGridMode;
  collection?: boolean;
  title?: string;
  subtitle?: string;
}

export interface NormalizedDataGridOptions extends Omit<Readonly<Normalized<DataGridOptions>>, 'itemList'> {
  mode: DataGridMode;
  itemList: ReadonlyArray<NormalizedDataGridItem>;
}

export function NormalizeDataGridOptions(options: Readonly<DataGridOptions>): Readonly<NormalizedDataGridOptions> {
  const {
    itemList,
    mode,
    collection,
  } = options;
  return Object.freeze({
    itemList: NormalizeDataGridItemList(itemList),
    mode: IsDataGridMode(mode) ? mode : DataGridMode.Plain,
    collection: collection ?? false,
    title: options.title ?? null,
    subtitle: options.subtitle ?? null,
  });
}
