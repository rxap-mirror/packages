export enum TableColumnKind {
  DEFAULT = 'default',
  DATE = 'date',
  CUSTOM = 'custom',
  LINK = 'link',
  ICON = 'icon',
  BOOLEAN = 'boolean',
  COMPONENT = 'component',
  COPY_TO_CLIPBOARD = 'copy-to-clipboard',
  TREE = 'tree',
  SPINNER = 'spinner',
  OPTIONS = 'options',
}

export function IsTableColumnKind(value: string): value is TableColumnKind {
  return Object.values(TableColumnKind).includes(value as TableColumnKind);
}
