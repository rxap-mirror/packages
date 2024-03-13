import { Tree } from '@nx/devkit';
import { CoerceFilesStructure } from '@rxap/workspace-utilities';
import { join } from 'path';
import { generateGitlabCi } from './generate-gitlab-ci';
import { GitlabCiGeneratorSchema } from './schema';

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {

  console.log('docker gitlab-ci generator:', options);

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files'),
    target: 'tools/scripts',
    overwrite: options.overwrite,
  });

  generateGitlabCi(tree, options);

}

export default gitlabCiGenerator;
