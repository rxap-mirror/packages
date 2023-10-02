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
import {
  CoerceTarget,
  IsAngularProject,
  IsGeneratorProject,
  IsNestJsProject,
  IsPluginProject,
  IsSchematicProject,
} from '@rxap/workspace-utilities';
import initBuildableGenerator from '../init-buildable/generator';
import initPluginGenerator from '../init-plugin/generator';
import initPublishableGenerator from '../init-publishable/generator';
import { InitGeneratorSchema } from './schema';


function updateProjectTags(project: ProjectConfiguration) {
  const tags: string[] = project.root.split('/').filter(Boolean);
  const projectName = tags.pop(); // remove the last element this is the project name
  if (tags[0] === 'angular') {
    tags.push('ngx');
  }
  if (tags[0] === 'nest') {
    tags.push('nestjs');
  }
  CoerceProjectTags(project, tags);
  // if the tag list does not include the project name
  if (!tags.includes(projectName)) {
    // then remove the project name from the tags if it is included
    project.tags = project.tags.filter(tag => tag !== projectName);
  }
}

function updateProjectTargets(project: ProjectConfiguration) {

  if (!IsPluginProject(project) && !IsGeneratorProject(project) && !IsSchematicProject(project)) {
    CoerceTarget(project, 'index-export', {});
  }

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

    if (!options.skipProjects) {
      console.log(`init project: ${ projectName }`);

      updateProjectTags(project);

      updateProjectTargets(project);

      updateProjectConfiguration(tree, project.name, project);
    }

    if (IsBuildable(project)) {
      await initBuildableGenerator(tree, options);
    }

    if (IsPublishable(tree, project)) {
      await initPublishableGenerator(tree, options);
    }

    if (IsAngularProject(project)) {
      await AngularInitGenerator(tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

    if (IsPluginProject(project)) {
      await initPluginGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

    if (IsNestJsProject(project)) {
      await nestJsInitGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

  }

}

export default initGenerator;
