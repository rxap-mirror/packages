import { Normalized } from '@rxap/utilities';
import {
  DataGridItem,
  NormalizeDataGridItemList,
  NormalizedDataGridItem,
} from './data-grid-item';
import { DataGridMode } from './data-grid-mode';

function IsDataGridMode(value: any): value is DataGridMode {
  return Object.values(DataGridMode).includes(value);
}

export interface DataGridOptions {
  itemList?: Array<DataGridItem>;
  mode?: DataGridMode;
  collection?: boolean;
  title?: string;
  subtitle?: string;
  inCard?: boolean;
}

export interface NormalizedDataGridOptions extends Omit<Readonly<Normalized<DataGridOptions>>, 'itemList'> {
  mode: DataGridMode;
  itemList: ReadonlyArray<NormalizedDataGridItem>;
  isForm: boolean;
}

export function NormalizeDataGridOptions(options: Readonly<DataGridOptions>): Readonly<NormalizedDataGridOptions> {
  const {
    itemList,
    collection,
  } = options;
  let { mode } = options;
  mode = IsDataGridMode(mode) ? mode : DataGridMode.Plain;
  return Object.freeze({
    itemList: NormalizeDataGridItemList(itemList),
    mode,
    collection: collection ?? false,
    title: options.title ?? null,
    subtitle: options.subtitle ?? null,
    inCard: options.inCard ?? true,
    isForm: mode === DataGridMode.Form,
  });
}
