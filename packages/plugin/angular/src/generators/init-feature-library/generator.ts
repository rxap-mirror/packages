import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  SkipNonAngularProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitFeatureLibraryGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: InitFeatureLibraryGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!project.tags?.includes('feature')) {
    return true;
  }

  return false;

}

export async function initFeatureLibraryGenerator(
  tree: Tree,
  options: InitFeatureLibraryGeneratorSchema
) {options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('angular feature library init generator:', options);

  await initWorkspace(tree, options);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-angular',
        'init-feature-library',
        options,
      );

      await initProject(tree, projectName, project, options);

    }



  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initFeatureLibraryGenerator;
