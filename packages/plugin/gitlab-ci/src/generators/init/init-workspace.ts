import { Tree } from '@nx/devkit';
import { generateGitlabCiSetupScript } from './generate-gitlab-setup-script';
import { generateWithComponents } from './generate-with-components';
import { generateWithLocalFiles } from './generate-with-local-files';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init gitlab ci workspace');

  if (options.components) {
    generateWithComponents(tree, options);
  } else {
    generateWithLocalFiles(tree, options);
  }

  generateGitlabCiSetupScript(tree, options);

}
