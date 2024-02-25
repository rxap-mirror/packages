export enum AccordionItemKinds {
  Default = 'default',
  Table = 'table',
  DataGrid = 'data-grid',
  TreeTable = 'tree-table',
  Switch = 'switch',
}

export function IsAccordionItemKind(kind: string): kind is AccordionItemKinds {
  return (Object.values(AccordionItemKinds) as string[]).includes(kind);
}
