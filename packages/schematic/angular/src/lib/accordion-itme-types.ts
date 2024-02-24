export enum AccordionItemTypes {
  Default = 'default',
  Table = 'table',
  DataGrid = 'data-grid',
  TreeTable = 'tree-table',
  Switch = 'switch',
}

export function IsAccordionItemType(type: string): type is AccordionItemTypes {
  return (Object.values(AccordionItemTypes) as string[]).includes(type);
}
