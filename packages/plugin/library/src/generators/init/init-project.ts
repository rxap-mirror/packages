import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceIgnorePattern,
  HasMigrations,
  IsBuildable,
  IsPluginProject,
  IsPresetProject,
  IsPublishable,
  IsSchematicProject,
  SearchFile,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  Builder,
  parseStringPromise,
} from 'xml2js';
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

  if (IsBuildable(project)) {
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

  try {
    if (tree.exists('.idea/workspace.xml')) {
      const excludeFolders = [
        'file://$MODULE_DIR$/' + join(project.root, 'dist'),
        'file://$MODULE_DIR$/' + join(project.root, 'docs'),
        'file://$MODULE_DIR$/' + join(project.root, 'compodoc'),
        'file://$MODULE_DIR$/' + join(project.root, 'coverage'),
      ];
      // uses jetbrains IDE
      for (const {
        path,
        content
      } of SearchFile(tree, '/.idea')) {
        if (path.endsWith('.iml')) {
          const doc = await parseStringPromise(content.toString());
          for (const excludeFolder of excludeFolders) {
            if (Array.from(doc.module.component[0].content[0].excludeFolder).map((item: any) => item['$'].url).some(
              (url: string) => url === excludeFolder)) {
              continue;
            }
            doc.module.component[0].content[0].excludeFolder.push({ '$': { url: excludeFolder } });
          }
          const builder = new Builder();
          tree.write(path, builder.buildObject(doc));
        }
      }
    }
  } catch (e: any) {
    console.log('error updating exclude folders in .idea/*.iml', e.message);
  }

  cleanup(tree, projectName);

}
