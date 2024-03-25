export enum TableColumnModifier {
  FILTER = 'filter',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SHOW = 'show',
  HIDDEN = 'hidden',
  NOWRAP = 'nowrap',
  WITHOUT_TITLE = 'withoutTitle',
  NO_TITLE = 'noTitle',
  OVERWRITE = 'overwrite',
}

export function IsTableColumnModifier(value: string): value is TableColumnModifier {
  return Object.values(TableColumnModifier).includes(value as TableColumnModifier);
}
