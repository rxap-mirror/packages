import {
  NormalizeTableHeaderButton,
  TableHeaderButton,
} from './table-header-button';
import {
  NormalizedTableColumn,
  NormalizeTableColumnList,
  TableColumn,
} from './table-column';
import {
  NormalizedTableAction,
  NormalizeTableActionList,
  TableAction,
} from './table-action';
import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import { ToTitle } from './to-title';

export interface MinimumTableOptions {
  headerButton?: string | TableHeaderButton;
  columnList: Array<string | TableColumn>;
  actionList: Array<string | TableAction>;
  modifiers?: string[];
  title?: string;
  componentName?: string;
}

export interface NormalizedMinimumTableOptions extends Readonly<Normalized<MinimumTableOptions>> {
  componentName: string;
  columnList: NormalizedTableColumn[];
  actionList: NormalizedTableAction[];
}

export function NormalizeMinimumTableOptions(
  options: Readonly<MinimumTableOptions>,
  name: string,
): NormalizedMinimumTableOptions {
  const componentName = options.componentName ?? CoerceSuffix(name, '-table');
  const actionList = NormalizeTableActionList(options.actionList);
  const columnList = NormalizeTableColumnList(options.columnList);
  const headerButton = NormalizeTableHeaderButton(options.headerButton, name);
  const modifiers = options.modifiers ?? [];
  const title = options.title ?? ToTitle(name);
  return Object.seal({
    componentName,
    actionList,
    columnList,
    headerButton,
    modifiers,
    title,
  });
}
