import {
  StatementedNode,
  StatementStructures,
  WriterFunction,
} from 'ts-morph';

export function CoerceStatements(
  node: StatementedNode,
  statements: (string | WriterFunction | StatementStructures)[] | string | WriterFunction,
  overwrite = false
) {
  if (overwrite) {
    const length = node.getStatements().length;
    if (length > 0) {
      node.removeStatements([0, length - 1]);
    }
  }
  if (node.getStatements().length === 0) {
    node.addStatements(statements);
  }
}
