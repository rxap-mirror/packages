export enum TableColumnKind {
  DEFAULT = 'default',
  DATE = 'date',
  LINK = 'link',
  ICON = 'icon',
  BOOLEAN = 'boolean',
  COMPONENT = 'component',
  COPY_TO_CLIPBOARD = 'copy-to-clipboard',
  TREE = 'tree',
  SPINNER = 'spinner',
}

export function IsTableColumnKind(value: string): value is TableColumnKind {
  return Object.values(TableColumnKind).includes(value as TableColumnKind);
}
