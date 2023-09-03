import { Tree } from '@nx/devkit';
import { GetProject } from '@rxap/generator-utilities';
import { LibraryIndexExportGenerator } from '@rxap/plugin-library';
import { dasherize } from '@rxap/utilities';
import {
  GenerateDataSource,
  GenerateDirectives,
  GenerateInterfaces,
  GenerateOperation,
  GenerateOperationCommand,
  GenerateRemoteMethod,
  GeneratorFunction,
  LoadOpenApiConfig,
  OpenApiSchema,
  ResolveRef,
} from '@rxap/workspace-open-api';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  DeleteRecursive,
  GetProjectPackageJson,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { GenerateGeneratorSchema } from './schema';

export async function generateGenerator(
  tree: Tree,
  options: GenerateGeneratorSchema,
) {

  console.log('loading openapi config');
  const openapi = await LoadOpenApiConfig(tree, options);
  console.log('resolve all schema refs');
  ResolveRef(openapi, openapi.paths);

  if (options.inline !== false) {
    options.inline = true;
  }

  if (!options.project) {
    options.project = 'open-api';
  }

  if (options.directory) {
    options.directory = options.directory.split('/').map(item => dasherize(item)).join('/');
  }

  if (!options.prefix) {
    options.prefix = GetProject(tree, options.project)['prefix'];
  }

  const projectName = options.project;

  const projectRoot = GetProjectRoot(tree, projectName);

  if (tree.exists(join(projectRoot, 'package.json'))) {
    const packageJson = GetProjectPackageJson(tree, projectName);
    options.packageName = packageJson.name;
  }

  const angularGeneratorFunctionList: GeneratorFunction<OpenApiSchema>[] = [];
  if (!options.skipRemoteMethod) {
    angularGeneratorFunctionList.push(GenerateRemoteMethod);
  }

  if (!options.skipDataSource) {
    angularGeneratorFunctionList.push(GenerateDataSource);
  }

  if (!options.skipDirectives) {
    angularGeneratorFunctionList.push(GenerateDirectives);
  }

  const nestGeneratorFunctionList: GeneratorFunction<OpenApiSchema>[] = [];
  if (!options.skipCommand) {
    nestGeneratorFunctionList.push(GenerateOperationCommand);
  }

  DeleteRecursive(tree, join(projectRoot, 'src'));
  if (tree.exists(join(projectRoot, 'angular', 'src'))) {
    DeleteRecursive(tree, join(projectRoot, 'angular', 'src'));
  }
  if (tree.exists(join(projectRoot, 'nest', 'src'))) {
    DeleteRecursive(tree, join(projectRoot, 'nest', 'src'));
  }

  TsMorphAngularProjectTransform(tree, {
    project: options.project,
  }, project => GenerateInterfaces(openapi, project));

  // generate the angular code
  TsMorphAngularProjectTransform(tree, {
    project: options.project,
    entrypoint: options.packageName ? 'angular' : undefined,
  }, project => GenerateOperation(openapi, project, options, angularGeneratorFunctionList));

  // generate the nestjs code
  TsMorphAngularProjectTransform(tree, {
    project: options.project,
    entrypoint: options.packageName ? 'nest' : undefined,
  }, project => GenerateOperation(openapi, project, options, nestGeneratorFunctionList));

  await LibraryIndexExportGenerator(tree, { projects: [ options.project ] });

}

export default generateGenerator;
