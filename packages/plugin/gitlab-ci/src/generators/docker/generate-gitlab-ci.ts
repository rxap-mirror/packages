import { Tree } from '@nx/devkit';
import { GetRootDockerOptions } from '@rxap/workspace-utilities';
import { generateDockerGitlabCiFileContent } from './generate-docker-gitlab-ci-file-content';
import { generateServiceE2eGitlabCiFileContent } from './generate-service-e2e-gitlab-ci-file-content';
import { generateStartupGitlabCiFileContent } from './generate-startup-gitlab-ci-file-content';
import { mergeYaml } from './merge-yaml';
import { DockerGeneratorSchema } from './schema';

export function GenerateGitlabCi(tree: Tree, options: DockerGeneratorSchema) {

  const rootDocker = GetRootDockerOptions(tree);

  const dockerGitlabCiYaml = generateDockerGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  const startupGitlabCiYaml = generateStartupGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);

  const serviceE2eGitlabCiYaml = generateServiceE2eGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/service-e2e.yaml', serviceE2eGitlabCiYaml);

}
