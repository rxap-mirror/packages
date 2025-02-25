import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  coerceIdeaExcludeFolders,
  CoerceIgnorePattern,
  HasMigrations,
  IsBuildable,
  isJetbrainsProject,
  IsPluginProject,
  IsPresetProject,
  IsPublishable,
  IsSchematicProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { initProject as initBuildableProject } from '../init-buildable/init-project';
import { initProject as initPluginProject } from '../init-plugin/init-project';
import { initProject as initPresetProject } from '../init-preset/init-project';
import { initProject as initPublishableProject } from '../init-publishable/init-project';
import { initProject as initSchematicProject } from '../init-schematic/init-project';
import { initProject as initWithMigrationProject } from '../init-with-migrations/init-project';
import { cleanup } from './cleanup';
import { InitGeneratorSchema } from './schema';
import { updateProjectTags } from './update-project-tags';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitGeneratorSchema) {
  console.log(`init library project: ${ projectName }`);

  updateProjectTags(project);

  if (IsBuildable(tree, project)) {
    initBuildableProject(tree, projectName, project, options);
  }

  if (IsPublishable(tree, project)) {
    await initPublishableProject(tree, projectName, project, options);
  }

  if (IsPluginProject(project)) {
    initPluginProject(tree, projectName, project, options);
  }

  if (IsPresetProject(project)) {
    initPresetProject(tree, projectName, project, options);
  }

  if (IsSchematicProject(project)) {
    initSchematicProject(tree, projectName, project, options);
  }

  if (HasMigrations(tree, { name: projectName })) {
    initWithMigrationProject(tree, projectName, project, options);
  }

  CoerceIgnorePattern(tree, join(project.root, '.eslintignore'), [
    'dist',
    'coverage',
    'node_modules',
  ]);

  if (isJetbrainsProject(tree)) {
    const excludeFolders = [
      join(project.root, 'dist'),
      join(project.root, 'docs'),
      join(project.root, 'compodoc'),
      join(project.root, 'coverage'),
    ];
    await coerceIdeaExcludeFolders(tree, excludeFolders);
  }

  cleanup(tree, projectName);

}
