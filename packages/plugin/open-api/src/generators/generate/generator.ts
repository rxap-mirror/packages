import {
  formatFiles,
  Tree,
} from '@nx/devkit';
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
} from '@rxap/workspace-open-api';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  CoerceFile,
  DeleteRecursive,
  GetProject,
  GetProjectPackageJson,
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { GenerateGeneratorSchema } from './schema';

export async function generateGenerator(
  tree: Tree,
  options: GenerateGeneratorSchema,
) {

  console.log('loading openapi config');
  const openapi = await LoadOpenApiConfig(tree, options);
  // console.log('resolve all schema refs');
  // ResolveRef(openapi, openapi.paths);

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

  DeleteRecursive(tree, join(projectRoot, 'src', 'lib'));
  if (tree.exists(join(projectRoot, 'src', 'index.ts'))) {
    tree.delete(join(projectRoot, 'src', 'index.ts'));
  }
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
  }, project => GenerateOperation(openapi, project, options, angularGeneratorFunctionList));

  // generate the nestjs code
  TsMorphAngularProjectTransform(tree, {
    project: options.project,
  }, project => GenerateOperation(openapi, project, options, nestGeneratorFunctionList));

  if (options.export) {
    await LibraryIndexExportGenerator(tree, { project: options.project });
  } else {
    CoerceFile(tree, join(GetProjectSourceRoot(tree, projectName), 'index.ts'), 'export {};', true);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default generateGenerator;
