import {
  formatFiles,
  Tree,
} from '@nx/devkit';
import { GenerateSerializedSchematicFile } from '@rxap/workspace-utilities';
import { GenerateGitlabCi } from './generate-gitlab-ci';
import { DockerGeneratorSchema } from './schema';

export async function dockerGenerator(
  tree: Tree,
  options: DockerGeneratorSchema,
) {

  console.log('docker gitlab-ci generator:', options);

  GenerateGitlabCi(tree, options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-gitlab-ci',
    'docker',
    options,
  );

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default dockerGenerator;
