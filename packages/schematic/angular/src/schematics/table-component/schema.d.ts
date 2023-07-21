import { TableRowAction } from '../table-action/schema';

export interface TableAction extends TableRowAction {
  role: string;
  icon?: string | null;
  svgIcon?: string | null;
  permission?: string | null;
}

export interface TableColumn {
  name: string;
  type?: string;
  modifiers?: string[];
  hasFilter?: boolean;
  title?: string;
  propertyPath?: string;
  hidden?: boolean;
  active?: boolean;
  inactive?: boolean;
  show?: boolean;
}

export interface TableHeaderButton {
  role?: string | null;
  permission?: string | null;
  icon?: string | null;
  svgIcon?: string | null;
}

export interface TableComponentOptions {
  selectColumn?: boolean;
  headerButton?: string | TableHeaderButton;
  name: string;
  project?: string;
  feature: string;
  columnList: Array<string | TableColumn>;
  actionList: Array<string | TableAction>;
  shared?: boolean;
  directory?: string;
  nestModule?: string;
  modifiers?: string[];
  overwrite?: boolean;
  title?: string;
  context?: string;
}
