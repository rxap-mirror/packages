import {StatementedNode, StatementStructures, WriterFunction} from 'ts-morph';

export function CoerceStatements(
  node: StatementedNode,
  statements: (string | WriterFunction | StatementStructures)[] | string | WriterFunction,
) {
  if (node.getStatements().length ===
    0) {
    node.addStatements(statements);
  }
}
