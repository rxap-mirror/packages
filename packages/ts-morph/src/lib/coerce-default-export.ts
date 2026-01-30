import {
  NameableNodeSpecific,
  NamedNodeSpecificBase,
  Node,
} from 'ts-morph';

/**
 * Ensures that the given node is the default export of its source file.
 *
 * @param node - The node to be exported as default.
 */
export function CoerceDefaultExport(node: (NamedNodeSpecificBase<any> | NameableNodeSpecific) & Node) {

  const sourceFile = node.getSourceFile();

  if (!sourceFile.getExportAssignments().some(ed => ed.getExpression().getText() === node.getName())) {
    sourceFile.addExportAssignment({
      isExportEquals: false,
      expression: node.getName()!,
    });
  }

}
