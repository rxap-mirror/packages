export enum AccordionItemKinds {
  Default = 'default',
  Table = 'table',
  DataGrid = 'data-grid',
  TreeTable = 'tree-table',
  Switch = 'switch',
  Nested = 'nested',
}

export function IsAccordionItemKind(kind: string): kind is AccordionItemKinds {
  return (Object.values(AccordionItemKinds) as string[]).includes(kind);
}
