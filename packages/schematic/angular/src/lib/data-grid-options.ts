import {
  DataProperty,
  NormalizeDataPropertyList,
  NormalizedDataProperty,
  NormalizedUpstreamOptions,
  NormalizeUpstreamOptions,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  DeleteEmptyProperties,
  Normalized,
} from '@rxap/utilities';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from './accordion-identifier';
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
  upstream?: UpstreamOptions;
  propertyList?: DataProperty[];
  identifier?: AccordionIdentifier;
}

export interface NormalizedDataGridOptions extends Omit<Readonly<Normalized<DataGridOptions>>, 'itemList' | 'propertyList'> {
  mode: DataGridMode;
  itemList: ReadonlyArray<NormalizedDataGridItem>;
  isForm: boolean;
  upstream: NormalizedUpstreamOptions | null;
  propertyList: Array<NormalizedDataProperty>;
  identifier: NormalizedAccordionIdentifier | null;
}

export function NormalizeDataGridOptions(options: Readonly<DataGridOptions>): Readonly<NormalizedDataGridOptions> {
  const {
    collection,
  } = options;
  let { mode } = options;
  mode = IsDataGridMode(mode) ? mode : DataGridMode.Plain;
  const itemList = NormalizeDataGridItemList(options.itemList);
  const propertyList = options.propertyList ?? [];
  CoerceArrayItems(
    propertyList,
    // call the DeleteEmptyProperties function to remove any property that is empty (null, undefined, empty string)
    // so that if this property is already defined in the propertyList it will not overwrite a value with an empty value
    itemList.map(item => DeleteEmptyProperties({
      name: item.name,
      type: item.type,
      isOptional: item.isOptional,
      isArray: item.isArray,
      source: item.source,
      memberList: item.memberList,
    })),
    { compareTo: (a, b) => a.name === b.name },
  );
  CoerceArrayItems(
    propertyList,
    itemList
      .filter(item => item.formControl)
      .map(item => item.formControl!)
      // call the DeleteEmptyProperties function to remove any property that is empty (null, undefined, empty string)
      // so that if this property is already defined in the propertyList it will not overwrite a value with an empty value
      .map(control => DeleteEmptyProperties({
        name: control.name,
        type: control.type,
        isArray: control.isArray,
        isOptional: control.isOptional,
        source: control.source,
      })),
    { compareTo: (a, b) => a.name === b.name, merge: true },
  );
  return Object.freeze({
    itemList,
    mode,
    collection: collection ?? false,
    title: options.title ?? null,
    subtitle: options.subtitle ?? null,
    inCard: options.inCard ?? true,
    isForm: mode === DataGridMode.Form || itemList.some(item => item.formControl),
    upstream: NormalizeUpstreamOptions(options.upstream),
    propertyList: NormalizeDataPropertyList(propertyList),
    identifier: NormalizeAccordionIdentifier(options.identifier),
  });
}
