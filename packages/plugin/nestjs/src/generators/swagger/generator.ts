import {
  generateFiles,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  AddPackageJsonDependency,
  coerceIdeaExcludeFolders,
  CoerceIgnorePattern,
  GetProjectRoot,
  isJetbrainsProject,
} from '@rxap/workspace-utilities';
import * as path from 'path';
import { join } from 'path';
import { coerceEnvironmentFiles } from './coerce-environment-files';
import { SwaggerGeneratorSchema } from './schema';
import { updateNxDefaults } from './update-nx-defaults';
import { updateProjectTargets } from './update-project-targets';
import { updateWebpackConfig } from './update-webpack-config';

export async function swaggerGenerator(
  tree: Tree,
  options: SwaggerGeneratorSchema,
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  const projectName = options.project;
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    join(projectRoot, 'src'),
    {
      tmpl: '',
      projectName,
    },
  );

  const project = readProjectConfiguration(tree, projectName);

  coerceEnvironmentFiles(tree, options);
  updateNxDefaults(tree, options);
  updateWebpackConfig(tree, projectName, project);
  updateProjectTargets(tree, projectName, project, options);
  const projectSourceRoot = project.sourceRoot;
  if (!projectSourceRoot) {
    throw new Error('The selected project has no sourceRoot');
  }
  updateProjectConfiguration(tree, projectName, project);

  if (isJetbrainsProject(tree)) {
    await coerceIdeaExcludeFolders(tree, ['swagger']);
  }

  CoerceIgnorePattern(tree, '.nxignore', [ '!swagger/**/openapi.json' ]);
  CoerceIgnorePattern(tree, '.gitignore', [ 'swagger/**/*.*', '!swagger/**/openapi.json' ]);

  await AddPackageJsonDependency(tree, 'swagger-ui-express', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });

}

export default swaggerGenerator;
