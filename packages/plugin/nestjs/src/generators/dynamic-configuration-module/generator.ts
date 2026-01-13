import { Tree } from '@nx/devkit';
import { CreateProject } from '@rxap/ts-morph';
import {
  AddDir,
  ApplyTsMorphProject,
} from '@rxap/workspace-ts-morph';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import { coerceDynamicModule } from './coerce-dynamic-module';
import { coerceDynamicModuleOptionsToken } from './coerce-dynamic-module-options-token';
import { coerceOptionsFactory } from './coerce-options-factory';
import { coerceOptionsInterface } from './coerce-options-interface';
import { coerceValidationSchemaFunction } from './coerce-validation-schema-function';
import { findModuleFile } from './find-module-file';
import { DynamicConfigurationModuleGeneratorSchema } from './schema';
import {LibraryIndexExportGenerator} from '@rxap/plugin-library';

export async function dynamicConfigurationModuleGenerator(
  tree: Tree,
  options: DynamicConfigurationModuleGeneratorSchema
) {
  const project = CreateProject();
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const projectLibSourceRoot = join(projectSourceRoot, 'lib');
  AddDir(tree, projectLibSourceRoot, project);
  let moduleName = options.name ?? options.project;
  const moduleSourceFile = findModuleFile(project, moduleName);
  if (!moduleSourceFile) {
    throw new Error(`Could not find the module file of the project: ${ options.project }`);
  }
  const moduleClass = coerceDynamicModule(moduleSourceFile, options.isGlobal);
  moduleName = moduleClass.getName()!;
  coerceDynamicModuleOptionsToken(project, moduleName);
  coerceValidationSchemaFunction(project, moduleName);
  coerceOptionsFactory(project, moduleName);
  coerceOptionsInterface(project, moduleName);

  await ApplyTsMorphProject(tree, project, projectLibSourceRoot);

  await LibraryIndexExportGenerator(tree, {
    project: options.project,
    generateRootExport: true,
  });
}

export default dynamicConfigurationModuleGenerator;
