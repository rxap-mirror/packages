import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export interface GetNestApiPrefixOptions {
  apiPrefix?: string;
  projects?: string[];
}

export function GetNestApiPrefix(
  tree: TreeLike,
  options: GetNestApiPrefixOptions,
  projectSourceRoot: string,
  projectName: string,
) {
  if (options.apiPrefix && options.projects?.length === 1) {
    return options.apiPrefix;
  }
  const treeAdapter = new TreeAdapter(tree);
  if (tree.exists(join(projectSourceRoot, 'app', 'app.config.ts'))) {
    const match = treeAdapter.read(join(projectSourceRoot, 'app', 'app.config.ts'), 'utf-8')!
      .match(/validationSchema\['GLOBAL_API_PREFIX'\] = Joi.string\(\).default\('(.+)'\);/);
    if (match) {
      return match[1];
    }
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.module.ts'))) {
    const match = treeAdapter.read(join(projectSourceRoot, 'app', 'app.module.ts'), 'utf-8')!
      .match(/GLOBAL_API_PREFIX: Joi.string\(\).default\('(.+)'\)/);
    if (match) {
      return match[1];
    }
  }
  return join('api', projectName.replace(/^service-/, ''));
}
