import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Tree } from '@nx/devkit';
import {
  CoerceArrayItems,
  deepMerge,
  EachProperty,
  RemoveFromObject,
} from '@rxap/utilities';
import {
  GetProjectSourceRoot,
  SearchFile,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';
import { GenerateDefinitionsMap } from '../index-json-schema/generator';

import { BundleJsonSchemaGeneratorSchema } from './schema';

function resolveDefinition(tree: Tree, projectSourceRoot: string, { $ref }: { $ref: string }): any {
  const filePath = join(projectSourceRoot, $ref);
  if (!tree.exists(filePath)) {
    throw new Error(`The file '${filePath}' does not exist!`);
  }
  const schema = JSON.parse(tree.read(filePath).toString());
  if (schema['definitions']) {
    delete schema['definitions'];
  }
  if (schema['$schema']) {
    delete schema['$schema'];
  }
  if (schema['$id']) {
    delete schema['$id'];
  }
  for (const { key, value, propertyPath, parent } of EachProperty(schema)) {
    if (key === '$ref') {
      if (typeof value === 'string') {
        parent[key] = value.replace(/^#\/definitions\//, '#/definitions/');
      }
    }
  }
  // removeProperty(schema, 'definitions');
  // removeProperty(schema, '$id');
  // removeProperty(schema, '$schema');
  return schema;
}

function resolveDefinitionMap(tree: Tree, projectSourceRoot: string, definitions: Record<string, any>): Record<string, any> {
  const resolvedDefinitions: Record<string, any> = {};
  for (const [key, definition] of Object.entries(definitions)) {
    resolvedDefinitions[key] = resolveDefinition(tree, projectSourceRoot, definition);
  }
  return resolvedDefinitions;
}

export async function bundleJsonSchemaGenerator(
  tree: Tree,
  options: BundleJsonSchemaGeneratorSchema
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const workspaceRoot = tree.root;
  const definitions = resolveDefinitionMap(tree, projectSourceRoot, GenerateDefinitionsMap(tree, options));
  for (const file of SearchFile(tree, projectSourceRoot)) {
    if (file.path.endsWith('template.schema.json')) {
      const relativePathFromProjectSourceRoot = dirname(relative(projectSourceRoot, file.path));
      const schema = JSON.parse(file.content.toString());
      const bundledSchema = await $RefParser.bundle(schema, {
        resolve: {
          file: {
            canRead: ({ url }) => {
              if (url.startsWith('http')) {
                return false;
              }
              const relativeFromSchemaJsonFile = relative(workspaceRoot, url);
              const absoluteFromSourceRoot = join(relativePathFromProjectSourceRoot, relativeFromSchemaJsonFile);
              const absoluteFromWorkspaceRoot = join(projectSourceRoot, absoluteFromSourceRoot);
              return tree.isFile(absoluteFromWorkspaceRoot);
            },
            read: ({ url }) => {
              const relativeFromSchemaJsonFile = relative(workspaceRoot, url);
              const absoluteFromSourceRoot = join(relativePathFromProjectSourceRoot, relativeFromSchemaJsonFile);
              const absoluteFromWorkspaceRoot = join(projectSourceRoot, absoluteFromSourceRoot);
              return tree.read(absoluteFromWorkspaceRoot).toString();
            }
          }
        }
      });
      // removeProperty(bundledSchema, 'definitions');
      // removeProperty(bundledSchema, '$id');
      // removeProperty(bundledSchema, '$schema');
      bundledSchema['definitions'] = {
        ...bundledSchema['definitions'],
        ...definitions
      };
      fixNestaedDefinitions(bundledSchema);
      tree.write(file.path.replace('template.schema.json', 'schema.json'), JSON.stringify(bundledSchema, null, 2));
    }
  }
}

function removeProperty(obj: any, propertyName: string) {
  const propertyPaths: string[] = [];
  for (const { key, propertyPath } of EachProperty(obj)) {
    if (key === propertyName) {
      propertyPaths.push(propertyPath);
    }
  }
  for (const propertyPath of propertyPaths) {
    if (propertyPath === propertyName) {
      continue;
    }
    RemoveFromObject(obj, propertyPath);
  }
}

function getUsedDefinitions(item: any): string[] {
  const usedDefinitions: string[] = [];

  for (const { key, value, parent } of EachProperty(item)) {
    if (key === '$ref') {
      if (typeof value !== 'string') {
        throw new Error(`The value of the key '$ref' in definition '${key}' is not a string!`);
      }
      usedDefinitions.push(value.replace(/^#\/definitions\//, ''));
    }
  }

  return usedDefinitions;
}

function fixNestaedDefinitions(schema: any) {
  const usedDefinitions: string[] = [];
  // create a list of used refs excluding the definitions
  for (const [key, item] of Object.entries(schema ?? {})) {
    if (key === 'definitions') {
      continue;
    }
    if (typeof item !== 'object') {
      continue;
    }
    CoerceArrayItems(usedDefinitions, getUsedDefinitions(item));
  }
  let removeList = Object.keys(schema.definitions).filter((key) => !usedDefinitions.includes(key));
  for (let i = 0; i < removeList.length; i++) {
    // check for each definition that will not be removed if it is using another definition that should be removed
    // if yes remove this from the list of definitions to remove
    for (const [ key, item ] of Object.entries(schema.definitions ?? {})) {
      if (removeList.includes(key)) {
        continue;
      }
      CoerceArrayItems(usedDefinitions, getUsedDefinitions(item));
    }
    removeList = removeList.filter((key) => !usedDefinitions.includes(key));
  }
  for (const key of removeList) {
    delete schema.definitions[key];
  }
}

export default bundleJsonSchemaGenerator;
