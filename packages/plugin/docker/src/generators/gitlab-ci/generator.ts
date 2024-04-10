import { Tree } from '@nx/devkit';
import { DockerGitlabCiGenerator } from '@rxap/plugin-gitlab-ci';
import { GitlabCiGeneratorSchema } from './schema';

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {
  await DockerGitlabCiGenerator(tree, options);
  console.log('deprecated use @rxap/plugin-gitlab-ci:docker');
}

export default gitlabCiGenerator;
