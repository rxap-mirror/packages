import {
  generateFiles,
  ProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { GetProjectRoot } from '@rxap/generator-utilities';
import {
  GetTarget,
  GetTargetOptions,
} from '@rxap/plugin-utilities';
import {
  AddPackageJsonDependency,
  CoerceNxJsonCacheableOperation,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import * as path from 'path';
import { join } from 'path';
import { SwaggerGeneratorSchema } from './schema';

function updateProjectTargets(project: ProjectConfiguration, options: SwaggerGeneratorSchema) {

  if (!options.standalone) {
    const buildTarget = GetTarget(project, 'build');
    const buildTargetOptions = GetTargetOptions(buildTarget);

    if (!buildTargetOptions['outputPath']) {
      throw new Error('The selected project has the build target without the option outputPath');
    }
    if (!buildTargetOptions['tsConfig']) {
      throw new Error('The selected project has the build target without the option tsConfig');
    }

    const outputPath = (
      buildTargetOptions['outputPath'] as string
    ).replace('dist/', 'dist/swagger/');

    CoerceTarget(project, 'swagger-build', {
      options: {
        outputPath,
        main: `${ project.sourceRoot }/swagger.ts`,
        target: `node`,
        compiler: `tsc`,
        webpackConfig: `${ project.root }/webpack.config.js`,
        transformers: [ '@nestjs/swagger/plugin' ],
        tsConfig: buildTargetOptions['tsConfig'] as string,
        fileReplacements: [
          {
            replace: `${ project.sourceRoot }/environments/environment.ts`,
            with: `${ project.sourceRoot }/environments/environment.swagger.ts`,
          },
        ],
      },
    });

    CoerceTarget(project, 'swagger-generate', {}, Strategy.REPLACE);
  }

}

function updateNxDefaults(tree: Tree, options: SwaggerGeneratorSchema) {
  const nxJson = readNxJson(tree);

  if (!options.standalone) {
    CoerceNxJsonCacheableOperation(nxJson, 'swagger-build', 'swagger-generate');

    CoerceTarget(nxJson, 'swagger-generate', {
      executor: '@rxap/plugin-nestjs:swagger-generate',
      outputs: [
        '{workspaceRoot}/dist/swagger/{projectRoot}/openapi.json'
      ],
      inputs: [
        '{workspaceRoot}/dist/swagger/{projectRoot}/main.js',
        '{workspaceRoot}/dist/swagger/{projectRoot}/main.js.map'
      ],
      'dependsOn': [
        '^build'
      ]
    }, Strategy.REPLACE);

    CoerceTarget(nxJson, 'swagger-build', {
      executor: '@nx/webpack:webpack',
      outputs: [
        '{options.outputPath}',
      ],
      options: {
        transformers: [
          '@nestjs/swagger/plugin',
        ],
        compiler: 'tsc',
        target: 'node',
      },
      inputs: [
        'build',
        '^build',
      ],
      dependsOn: [
        '^build',
      ],
    }, Strategy.REPLACE);
  }

  updateNxJson(tree, nxJson);
}

export async function swaggerGenerator(
  tree: Tree,
  options: SwaggerGeneratorSchema,
) {
  const projectRoot = GetProjectRoot(tree, options.project);
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    join(projectRoot, 'src'),
    {
      tmpl: '',
      projectName: options.project,
    },
  );

  const project = readProjectConfiguration(tree, options.project);

  updateNxDefaults(tree, options);
  updateProjectTargets(project, options);
  const projectSourceRoot = project.sourceRoot;
  if (!projectSourceRoot) {
    throw new Error('The selected project has no sourceRoot');
  }
  updateProjectConfiguration(tree, options.project, project);

  await AddPackageJsonDependency(tree, 'swagger-ui-express', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });

}

export default swaggerGenerator;
