export interface SelectRowOptions<RowData = unknown> {
  multiple?: boolean;
  selected?: RowData[];
  emitChanges?: boolean;
  compareWith?: (o1: RowData, o2: RowData) => boolean
}
