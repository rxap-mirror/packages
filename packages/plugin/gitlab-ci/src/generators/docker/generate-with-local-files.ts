import { Tree } from '@nx/devkit';
import {
  CoerceFilesStructure,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { generateDockerGitlabCiFileContent } from './generate-docker-gitlab-ci-file-content';
import { generateServiceE2eGitlabCiFileContent } from './generate-service-e2e-gitlab-ci-file-content';
import { generateStartupGitlabCiFileContent } from './generate-startup-gitlab-ci-file-content';
import { mergeYaml } from './merge-yaml';
import { DockerGeneratorSchema } from './schema';

export function generateWithLocalFiles(tree: Tree, options: DockerGeneratorSchema, rootDocker: RootDockerOptions,) {

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files'),
    target: 'tools/scripts',
    overwrite: options.overwrite,
  });

  const dockerGitlabCiYaml = generateDockerGitlabCiFileContent(tree, options, rootDocker);

  mergeYaml(tree, '.gitlab/ci/jobs/docker.yaml', dockerGitlabCiYaml);

  if (!options.skipStartup) {
    const startupGitlabCiYaml = generateStartupGitlabCiFileContent(tree, options, rootDocker);
    mergeYaml(tree, '.gitlab/ci/jobs/startup.yaml', startupGitlabCiYaml);
  } else if (tree.exists('.gitlab/ci/jobs/startup.yaml')) {
    tree.delete('.gitlab/ci/jobs/startup.yaml');
  }

  if (!options.skipE2eService) {
    const serviceE2eGitlabCiYaml = generateServiceE2eGitlabCiFileContent(tree, options, rootDocker);

    mergeYaml(tree, '.gitlab/ci/jobs/service-e2e.yaml', serviceE2eGitlabCiYaml);
  } else if (tree.exists('.gitlab/ci/jobs/service-e2e.yaml')) {
    tree.delete('.gitlab/ci/jobs/service-e2e.yaml');
  }

}
