import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Tree } from '@nx/devkit';
import {
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

import { BundleJsonSchemaGeneratorSchema } from './schema';

export async function bundleJsonSchemaGenerator(
  tree: Tree,
  options: BundleJsonSchemaGeneratorSchema
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const workspaceRoot = tree.root;
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
      removeProperty(bundledSchema, 'definitions');
      removeProperty(bundledSchema, '$id');
      removeProperty(bundledSchema, '$schema');
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

function fixNestaedDefinitions({ definitions }: any) {
  if (!definitions) {
    return;
  }
  for (const [key, definition] of Object.entries(definitions)) {
    const nestedDefinitions: string[] = [];
    for (const { key, value } of EachProperty(definition)) {
      if (key === '$ref') {
        nestedDefinitions.push(value as string);
      }
    }
    for (const nested of nestedDefinitions) {
      const definitionName = nested.replace('#/definitions/', '');
      if (!definitions[definitionName]) {
        console.log(`Definition '${key}' has nested definition '${definitionName}' which is not defined!`);
      } else {
        definition['definitions'] ??= {};
        definition['definitions'][definitionName] = definitions[definitionName];
      }
    }
    console.log(`Definition '${key}' has nested definitions:`, nestedDefinitions);
  }
}

export default bundleJsonSchemaGenerator;
