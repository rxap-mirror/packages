import {
  StatementedNode,
  StatementStructures,
  WriterFunction,
} from 'ts-morph';

/**
 * Coerces statements in a statemented node (like a function or method body).
 * Can optionally overwrite existing statements.
 *
 * @param node - The node to add statements to.
 * @param statements - The statements to add.
 * @param overwrite - If true, removes existing statements before adding new ones.
 */
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
