import { Tree } from '@nx/devkit';
import { generateGitlabCi } from './generate-gitlab-ci';
import { GitlabCiGeneratorSchema } from './schema';

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {
  console.log('localazy gitlab-ci generator:', options);

  generateGitlabCi(tree, options);

}

export default gitlabCiGenerator;
