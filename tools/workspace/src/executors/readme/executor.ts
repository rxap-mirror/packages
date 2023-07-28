import {
  ExecutorContext,
  ProjectConfiguration,
  readJsonFile,
} from '@nx/devkit';
import { readFile } from '@nx/plugin/testing';
import { readPackageJsonForProject } from '@rxap/plugin-utilities';
import {
  existsSync,
  writeFileSync,
} from 'fs';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { ReadmeExecutorSchema } from './schema';

function getTemplate(context: ExecutorContext) {
  const readmeTemplateFile = readFile(join(context.root, 'README.md.handlebars'));

  return Handlebars.compile(readmeTemplateFile);
}

function getGroupKeyForProject(project: ProjectConfiguration): string {
  switch (true) {

    case project.tags?.includes('node'):
      return 'Node';

    case project.tags?.includes('plugin'):
      return 'NX Plugin';

    case project.tags?.includes('generator'):
      return 'NX Generator';

    case project.tags?.includes('schematic'):
      return 'NX Schematic';

    case project.tags?.includes('nest'):
      return 'NestJS';

    case project.tags?.includes('angular') && project.tags?.includes('material'):
      return 'Angular Material';

    case project.tags?.includes('angular'):
      return 'Angular';

    case project.tags?.includes('utilities'):
      return 'Utilities';

    case project.tags?.includes('workspace'):
      return 'Workspace';

    case project.tags?.includes('data-structure'):
      return 'Data Structure';

    default:
      return '';

  }
}

function getProjects(context: ExecutorContext) {
  const { projectsConfigurations } = context;
  if (!projectsConfigurations) {
    throw new Error('projectsConfigurations not defined');
  }
  const groupedProjectList: Record<string, Array<{ name: string, description: string }>> = {};
  for (const [ project, config ] of Object.entries(projectsConfigurations.projects)) {
    if (config.projectType !== 'library') {
      continue;
    }
    if (config.tags?.includes('internal')) {
      continue;
    }
    if (!existsSync(join(config.root, 'package.json'))) {
      continue;
    }
    const packageJson = readPackageJsonForProject(context, project);
    if (packageJson.private) {
      continue;
    }
    if (packageJson.name.startsWith('@rxap/')) {
      const group = getGroupKeyForProject(config);
      if (!groupedProjectList[group]) {
        groupedProjectList[group] = [];
      }
      groupedProjectList[group].push({
        name: packageJson.name,
        description: packageJson.description ?? '',
      });
    }
  }
  return Object.entries(groupedProjectList).sort(([ a ], [ b ]) => a.localeCompare(b))
               .map(([ group, list ]) => [
                 group,
                 list.sort((a, b) => a.name.localeCompare(b.name)),
               ] as [ string, any ])
               .reduce((acc, [ group, projects ]) => ({
                 ...acc,
                 [group]: projects,
               }), {});
}

export default async function runExecutor(
  options: ReadmeExecutorSchema,
  context: ExecutorContext,
) {

  const template = getTemplate(context);
  const packageJson = readJsonFile(join(context.root, 'package.json'));
  const projects = getProjects(context);

  console.log('Input for README.md template ready');

  console.log('projects', projects);

  const readme = template({
    packageJson,
    projects,
  });

  console.log('README.md generated');

  writeFileSync(join(context.root, 'README.md'), readme);

  return {
    success: true,
  };
}
