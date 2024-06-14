import { Tree } from '@nx/devkit';
import {
  CoerceFile,
  RootDockerOptions,
} from '@rxap/workspace-utilities';
import {
  parse,
  stringify,
} from 'yaml';
import {
  Include,
  IsComponentInclude,
  IsLocalInclude,
} from '../init/coerce-include';
import {
  CoerceInputs,
  IncludeComponentInput,
} from '../init/coerce-inputs';
import { buildDockerMatrix } from './generate-docker-gitlab-ci-file-content';
import { buildServiceE2eMatrix } from './generate-service-e2e-gitlab-ci-file-content';
import { buildStartupMatrix } from './generate-startup-gitlab-ci-file-content';
import { DockerGeneratorSchema } from './schema';

export function generateWithComponents(tree: Tree, options: DockerGeneratorSchema, rootDocker: RootDockerOptions) {

  const gitlabCiContent = CoerceFile(tree, '.gitlab-ci.yml', '', options.overwrite);

  const gitlabCi: { include: Include[] } = parse(gitlabCiContent) ?? {};

  gitlabCi.include ??= [];

  const include: Include | undefined = gitlabCi.include.find(include =>
    (IsComponentInclude(include) && include.component.startsWith('gitlab.com/rxap/gitlab-ci/nx-workspace@')) ||
    (IsLocalInclude(include) && include.local === 'templates/nx-workspace.yml')
  );

  if (!include || (!IsComponentInclude(include) && !IsLocalInclude(include))) {
    throw new Error('The project does not use the nx-workspace component');
  }

  // the project uses the nx-workspace component
  const inputs: IncludeComponentInput = {
    startup_matrix: buildStartupMatrix(tree, options, rootDocker),
    docker_matrix: buildDockerMatrix(tree, options, rootDocker),
    service_e2e_matrix: buildServiceE2eMatrix(tree, options, rootDocker),
  };

  include.inputs ??= {};
  CoerceInputs(include.inputs, inputs);

  tree.write('.gitlab-ci.yml', stringify(gitlabCi));

}
