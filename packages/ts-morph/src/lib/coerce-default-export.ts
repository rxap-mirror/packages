import {
  NameableNodeSpecific,
  NamedNodeSpecificBase,
  Node,
} from 'ts-morph';

export function CoerceDefaultExport(node: (NamedNodeSpecificBase<any> | NameableNodeSpecific) & Node) {

  const sourceFile = node.getSourceFile();

  if (!sourceFile.getExportAssignments().some(ed => ed.getExpression().getText() === node.getName())) {
    sourceFile.addExportAssignment({
      isExportEquals: false,
      expression: node.getName()!,
    });
  }

}
