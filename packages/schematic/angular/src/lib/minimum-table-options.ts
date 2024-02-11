import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import { MergeWithColumnList } from './merge-with-column-list';
import {
  NormalizedTableAction,
  NormalizeTableActionList,
  TableAction,
} from './table-action';
import {
  NormalizedTableColumn,
  NormalizeTableColumnList,
  TableColumn,
} from './table-column';
import {
  NormalizeTableHeaderButton,
  TableHeaderButton,
} from './table-header-button';
import {
  NormalizedDataProperty,
  NormalizeDataPropertyList,
  DataProperty,
} from './data-property';
import { ToTitle } from './to-title';

export interface MinimumTableOptions {
  headerButton?: string | TableHeaderButton;
  columnList: Array<string | TableColumn>;
  actionList: Array<string | TableAction>;
  propertyList: Array<string | DataProperty>;
  modifiers?: string[];
  title?: string;
  componentName?: string;
}

export interface NormalizedMinimumTableOptions
  extends Readonly<Omit<Normalized<MinimumTableOptions>, 'columnList' | 'actionList' | 'propertyList'>> {
  componentName: string;
  columnList: ReadonlyArray<NormalizedTableColumn>;
  actionList: ReadonlyArray<NormalizedTableAction>;
  propertyList: ReadonlyArray<NormalizedDataProperty>;
}

export function NormalizeMinimumTableOptions(
  options: Readonly<MinimumTableOptions>,
  name: string,
  suffix = '-table',
): NormalizedMinimumTableOptions {
  const componentName = options.componentName ?? CoerceSuffix(name, suffix);
  const actionList = NormalizeTableActionList(options.actionList);
  const columnList = NormalizeTableColumnList(options.columnList);
  const propertyList = NormalizeDataPropertyList(options.propertyList);
  const headerButton = NormalizeTableHeaderButton(options.headerButton, name);
  const modifiers = options.modifiers ?? [];
  const title = options.title ?? ToTitle(name);
  return Object.freeze({
    componentName,
    actionList,
    columnList,
    headerButton,
    modifiers,
    title,
    propertyList: MergeWithColumnList(propertyList, columnList),
  });
}
