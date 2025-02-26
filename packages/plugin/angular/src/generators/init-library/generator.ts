import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  ForeachInitProject,
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  SkipNonAngularProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { coerceProjects } from './coerce-projects';
import { initProject } from './init-project';
import { initWorkspace } from './init-workspace';
import { InitLibraryGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: InitLibraryGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  if (options.indexExport !== undefined) {
    options.targets ??= {};
    options.targets.indexExport = options.indexExport;
    delete options.indexExport;
  }
  console.log('angular library init generator:', options);

  await initWorkspace(tree, options);

  if (options.coerce) {
    await coerceProjects(tree, options);
  }

  for (const [ projectName, project ] of ForeachInitProject(tree, options, skipProject)) {

    GenerateSerializedSchematicFile(
      tree,
      GetProjectRoot(tree, projectName),
      '@rxap/plugin-angular',
      'init-library',
      options,
    );

    await initProject(tree, projectName, project, options);

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
