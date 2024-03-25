export enum TableColumnSticky {
  START = 'start',
  END = 'end',
}

export function IsTableColumnSticky(value: string): value is TableColumnSticky {
  return Object.values(TableColumnSticky).includes(value as TableColumnSticky);
}
