import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import * as process from 'process';
import { createOpenApi } from './open-ai-instance';
import { processProject } from './process-project';
import { DocumentationGeneratorSchema } from './schema';

function skipProject(project: ProjectConfiguration, projectName: string, options: DocumentationGeneratorSchema) {

  if (options.project === projectName) {
    return false;
  }

  if (options.projects?.length) {
    return !options.projects.includes(projectName);
  }

  return false;

}

export async function documentationGenerator(
  tree: Tree,
  options: DocumentationGeneratorSchema,
) {

  const openaiApiKey = options.openaiApiKey ?? process.env.OPENAI_API_KEY;
  const openaiOrganization = options.openaiOrgId ?? process.env.OPENAI_ORG_ID;
  const openaiProjectId = options.openaiProjectId ?? process.env.OPENAI_PROJECT_ID;

  if (!openaiApiKey) {
    throw new Error('Can not find OPENAI_API_KEY environment variable');
  }

  if (!openaiOrganization) {
    throw new Error('Can not find OPENAI_ORGANIZATION environment variable');
  }

  if (!openaiProjectId) {
    throw new Error('Can not find OPENAI_PROJECT_ID environment variable');
  }

  await createOpenApi({
    apiKey: openaiApiKey,
    organization: openaiOrganization,
    project: openaiProjectId,
  });

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(project, projectName, options)) {
      continue;
    }

    await processProject(options, projectName, tree);

  }

}

export default documentationGenerator;
