import { JSDocableNode } from 'ts-morph';

export function clearJsDoc(node: JSDocableNode) {
  node.getJsDocs().forEach(item => item.remove());
}
