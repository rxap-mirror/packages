import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import {
  AddPackageJsonDevDependency,
  GenerateSerializedSchematicFile,
  GetNxVersion,
  IsApplicationProject,
  IsLibraryProject,
} from '@rxap/workspace-utilities';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import initApplicationGenerator from '../init-application/generator';
import initLibraryGenerator from '../init-library/generator';
import { InitGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: InitGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('nestjs init generator:', options);

  GenerateSerializedSchematicFile(
    tree,
    '/',
    '@rxap/plugin-nestjs',
    'init',
    options,
  );

  await AddPackageJsonDevDependency(tree, '@nx/nest', GetNxVersion(tree), { soft: true });

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!options.skipProjects) {

      console.log(`init nestjs project: ${ projectName }`);

    }

    if (IsLibraryProject(project)) {
      await initLibraryGenerator(tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

    if (IsApplicationProject(project)) {
      await initApplicationGenerator(tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initGenerator;
