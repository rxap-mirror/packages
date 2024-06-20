import { JSDocableNode } from 'ts-morph';
import { cleanupJsDoc } from './cleanup-js-doc';
import { DocumentationGeneratorSchema } from './schema';

export function addJsDoc(options: DocumentationGeneratorSchema, node: JSDocableNode, jsDoc: string) {

  if (options.offline) {
    return;
  }

  node.addJsDoc(cleanupJsDoc(jsDoc));
}
