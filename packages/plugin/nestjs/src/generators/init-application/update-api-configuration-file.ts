import { Tree } from '@nx/devkit';
import { UpdateJsonFile } from '@rxap/workspace-utilities';

export function updateApiConfigurationFile(
  tree: Tree, projectName: string, apiPrefix: string, apiConfigurationFile?: string) {
  if (apiConfigurationFile) {
    UpdateJsonFile(tree, json => {
      json[projectName] = { baseUrl: `/${ apiPrefix }` };
    }, apiConfigurationFile, { create: true });
  }
}
