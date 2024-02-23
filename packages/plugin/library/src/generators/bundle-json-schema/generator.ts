import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import {
  GetProjectSourceRoot,
  SearchFile,
} from '@rxap/workspace-utilities';
import $RefParser from '@apidevtools/json-schema-ref-parser';
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
      tree.write(file.path.replace('template.schema.json', 'schema.json'), JSON.stringify(bundledSchema, null, 2));
    }
  }
}

export default bundleJsonSchemaGenerator;
