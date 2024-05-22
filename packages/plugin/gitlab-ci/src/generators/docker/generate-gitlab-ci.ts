import { Tree } from '@nx/devkit';
import { GetRootDockerOptions } from '@rxap/workspace-utilities';
import { generateWithComponents } from './generate-with-components';
import { generateWithLocalFiles } from './generate-with-local-files';
import { DockerGeneratorSchema } from './schema';

export function GenerateGitlabCi(tree: Tree, options: DockerGeneratorSchema) {

  const rootDocker = GetRootDockerOptions(tree);

  if (options.components) {
    generateWithComponents(tree, options, rootDocker);
  } else {
    generateWithLocalFiles(tree, options, rootDocker);
  }



}
