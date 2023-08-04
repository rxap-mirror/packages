import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceProjectTags,
  IsBuildable,
  IsPublishable,
  SkipNonLibraryProject,
} from '@rxap/generator-utilities';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import { nestJsInitGenerator } from '@rxap/plugin-nestjs';
import initBuildableGenerator from '../init-buildable/generator';
import initPluginGenerator from '../init-plugin/generator';
import initPublishableGenerator from '../init-publishable/generator';
import { InitGeneratorSchema } from './schema';


function updateProjectTags(project: ProjectConfiguration) {
  const tags: string[] = project.root.split('/').filter(Boolean);
  tags.unshift(); // remove the first element this is libs or packages, etc.
  if (tags[0] === 'angular') {
    tags.push('ngx');
  }
  if (tags[0] === 'nest') {
    tags.push('nestjs');
  }
  CoerceProjectTags(project, tags);
}

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('library init generator:', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTags(project);

    updateProjectConfiguration(tree, project.name, project);

    if (IsBuildable(project)) {
      await initBuildableGenerator(tree, options);
    }

    if (IsPublishable(tree, project)) {
      await initPublishableGenerator(tree, options);
    }

    if (project.tags?.includes('angular')) {
      await AngularInitGenerator(tree, { ...options, projects: [ projectName ] });
    }

    if (project.tags?.includes('plugin')) {
      await initPluginGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
        },
      );
    }

    if (project.tags?.includes('nest')) {
      await nestJsInitGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
        },
      );
    }

  }

}

export default initGenerator;
