import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { clone } from '@rxap/utilities';
import { IsApplicationProject } from '@rxap/workspace-utilities';
import { stringify } from 'yaml';
import { GitlabCiGeneratorSchema } from './schema';

const dotLocalazy = {
  extends: '.run',
  tags: [ 'e2-standard-4' ],
  stage: 'localazy',
  rules: [
    {
      if: '$LOCALAZY_WRITE_KEY == null',
      when: 'never',
    },
    {
      when: 'on_success',
    },
  ],
  environment: {
    action: 'prepare',
  },
  needs: [
    {
      job: 'build',
      artifacts: false,
    },
  ],
};

const localazy = {
  extends: '.localazy',
  environment: {
    name: '$ENVIRONMENT_NAME',
  },
};

function skipProject(tree: Tree, options: GitlabCiGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (!IsApplicationProject(project)) {
    return true;
  }

  if (!project.targets?.['localazy-upload']) {
    return true;
  }

  return false;

}

export async function gitlabCiGenerator(
  tree: Tree,
  options: GitlabCiGeneratorSchema,
) {

  const dockerYaml: any = {
    '.localazy': dotLocalazy,
  };

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`add project: ${ projectName }`);

    dockerYaml[`${ projectName }:localazy-upload`] = clone(localazy);
    dockerYaml[`${ projectName }:localazy-upload`].environment.name += `/${ projectName }`;

  }

  const gitlabCiYaml = stringify(dockerYaml);

  console.log('.gitlab/ci/jobs/localazy.yaml');
  console.log(gitlabCiYaml);
  tree.write('.gitlab/ci/jobs/localazy.yaml', gitlabCiYaml);

}

export default gitlabCiGenerator;
