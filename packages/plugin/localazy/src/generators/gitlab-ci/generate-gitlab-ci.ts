import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { IsApplicationProject } from '@rxap/workspace-utilities';
import { stringify } from 'yaml';
import { GitlabCiGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: GitlabCiGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (!IsApplicationProject(project)) {
    return true;
  }

  if (!project.targets?.['localazy-upload']) {
    return true;
  }

  return false;

}

export function generateGitlabCi(tree: Tree, options: GitlabCiGeneratorSchema,) {

  const dotLocalazy: any = {
    extends: '.run',
    stage: 'localazy',
    environment: {
      action: 'prepare',
    },
    variables: {
      TARGET: '${PROJECT_NAME}:localazy-upload'
    }
  };

  if (options.tags) {
    dotLocalazy.tags = options.tags;
  }

  const dockerYaml = {
    '.localazy': dotLocalazy,
    'localazy-upload': {
      extends: '.localazy',
      environment: {
        name: '$ENVIRONMENT_NAME/$PROJECT_NAME',
      },
      parallel: {
        matrix: [] as Record<string, any>,
      }
    }
  };

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`add project: ${ projectName } to localazy gitlab-ci configuration`);

    dockerYaml['localazy-upload'].parallel.matrix.push({
      PROJECT_NAME: projectName,
    });

  }

  const gitlabCiYaml = stringify(dockerYaml);

  tree.write('.gitlab/ci/jobs/localazy.yaml', gitlabCiYaml);

}
