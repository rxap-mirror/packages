import { JSDocableNode } from 'ts-morph';

export function hasJsDoc(node: JSDocableNode) {
  return node.getJsDocs().length > 0;
}
