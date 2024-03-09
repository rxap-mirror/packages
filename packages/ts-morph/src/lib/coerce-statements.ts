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
    node.removeStatements([0, node.getStatements().length - 1]);
  }
  if (node.getStatements().length === 0) {
    node.addStatements(statements);
  }
}
