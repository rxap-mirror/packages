import { Tree } from '@nx/devkit';
import { GetRootDockerOptions } from '@rxap/workspace-utilities';
import { generateDockerGitlabCiFileContent } from './generate-docker-gitlab-ci-file-content';
import { generateStartupGitlabCiFileContent } from './generate-startup-gitlab-ci-file-content';
import { mergeYaml } from './merge-yaml';
import { GitlabCiGeneratorSchema } from './schema';

export function generateGitlabCi(tree: Tree, options: GitlabCiGeneratorSchema) {

  const rootDocker = GetRootDockerOptions(tree);

  const dockerGitlabCiYaml = generateDockerGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  const startupGitlabCiYaml = generateStartupGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);

}
