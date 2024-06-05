export enum TableActionKind {
  DEFAULT = 'default',
  DIALOG = 'dialog',
  FORM = 'form',
  NAVIGATION = 'navigation',
  OPEN_API = 'open-api',
  OPERATION = 'operation'
}

export function IsTableActionKind(value: string): value is TableActionKind {
  return Object.values(TableActionKind).includes(value as TableActionKind);
}
