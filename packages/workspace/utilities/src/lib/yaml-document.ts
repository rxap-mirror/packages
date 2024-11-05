import {
  equals,
  IsFunction,
  isPromise,
} from '@rxap/utilities';
import {
  parseDocument,
  stringify,
} from 'yaml';
import { Document } from 'yaml/dist/doc/Document';
import type {
  Node,
  ParsedNode,
} from 'yaml/dist/nodes/Node';
import type {
  DocumentOptions,
  ParseOptions,
  SchemaOptions,
} from 'yaml/dist/options';
import { CoerceFile } from './coerce-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function HasYamlDocument<Tree extends TreeLike>(tree: Tree, filePath: string): boolean {

  const treeAdapter = new TreeAdapter(tree);

  if (treeAdapter.exists(filePath)) {
    const content = treeAdapter.read(filePath)!.toString();

    try {
      parseDocument(content);
    } catch (e: any) {
      return false;
    }
    return true;
  }
  return false;
}

export function GetYamlDocument<Contents extends Node = ParsedNode, Strict extends boolean = true>(tree: TreeLike, filePath: string, create = false, options?: ParseOptions & DocumentOptions & SchemaOptions): Contents extends ParsedNode ? Document.Parsed<Contents, Strict> : Document<Contents, Strict> {

  const treeAdapter = new TreeAdapter(tree);

  if (!tree.exists(filePath)) {
    if (!create) {
      throw new Error(`A yaml file at path '${ filePath }' does not exists`);
    } else {
      treeAdapter.create(filePath, '{}');
    }
  }

  const content = treeAdapter.read(filePath)!.toString();

  try {
    return parseDocument<Contents, Strict>(content, options);
  } catch (e: any) {
    throw new Error(`Could not parse the yaml file '${ filePath }': ${ e.message }`);
  }

}

export interface UpdateYamlDocumentOptions {
  space?: number;
  /**
   * true - create the file if it does not exist
   */
  coerce?: boolean;
  options?: ParseOptions & DocumentOptions & SchemaOptions;
}

export function UpdateYamlDocument<Contents extends Node = ParsedNode, Strict extends boolean = true>(
  tree: TreeLike,
  updater: ((yamlDocument: Contents extends ParsedNode ? Document.Parsed<Contents, Strict> : Document<Contents, Strict>) => void),
  filePath: string,
  options?: UpdateYamlDocumentOptions,
): void
export function UpdateYamlDocument<Contents extends Node = ParsedNode, Strict extends boolean = true>(
  tree: TreeLike,
  updater: ((yamlDocument: Contents extends ParsedNode ? Document.Parsed<Contents, Strict> : Document<Contents, Strict>) => Promise<void>),
  filePath: string,
  options?: UpdateYamlDocumentOptions,
): Promise<void>

export function UpdateYamlDocument<Contents extends Node = ParsedNode, Strict extends boolean = true>(
  tree: TreeLike,
  updater: ((yamlDocument: Contents extends ParsedNode ? Document.Parsed<Contents, Strict> : Document<Contents, Strict>) => void | Promise<void>),
  filePath: string,
  options?: UpdateYamlDocumentOptions,
): void | Promise<void> {
  let promise: Promise<void> | void | undefined;

  const yamlDocument = GetYamlDocument<Contents, Strict>(tree, filePath, options?.coerce, options?.options);

  updater(yamlDocument);

  const currentYamlDocument = GetYamlDocument<Contents, Strict>(tree, filePath, options?.coerce, options?.options);

  if (promise && isPromise(promise)) {
    return promise.then(() => {
      if (!equals(yamlDocument.toJSON(), currentYamlDocument.toJSON())) {
        CoerceFile(tree, filePath, yamlDocument.toString({ indent: options?.space ?? 2 }) + '\n', true);
      }
    });
  }

  if (!equals(yamlDocument.toJSON(), currentYamlDocument.toJSON())) {
    CoerceFile(tree, filePath, yamlDocument.toString({ indent: options?.space ?? 2 }) + '\n', true);
  }

}
