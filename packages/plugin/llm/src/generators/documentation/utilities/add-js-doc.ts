import { JSDocableNode } from 'ts-morph';

export function addJsDoc(node: JSDocableNode, jsDoc: string) {
  node.addJsDoc(jsDoc);
}
