export interface TableRowAction {
  type: string;
  refresh?: boolean;
  confirm?: boolean;
  tooltip?: string | null;
  errorMessage?: string | null;
  successMessage?: string | null;
  priority?: number | null;
  checkFunction?: string | null;
  inHeader?: boolean;
}

export interface TableActionOptions extends TableRowAction {
  project: string;
  feature: string;
  shared: boolean;
  tableName: string;
  directory?: string;
  override?: boolean;
}
