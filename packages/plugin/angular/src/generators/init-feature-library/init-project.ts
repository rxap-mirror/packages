import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceRoutes } from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  CoerceProjectTags,
  GetLibraryPathAliasName,
  GetProjectSourceRoot,
  HasProjectPackageJson,
  UpdateProjectPackageJson,
  UpdateTsConfigPaths,
} from '@rxap/workspace-utilities';
import { initProject as InitLibraryProject } from '../init-library/init-project';
import { InitFeatureLibraryGeneratorSchema } from './schema';

function coerceRoutesEntryPoint(tree: Tree, projectName: string) {
  TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [sourceFile]) => {
    CoerceRoutes(sourceFile, {});
  }, ['routes.ts?']);
}

function addRoutesImportPathToBaseTsConfig(tree: Tree, projectName: string) {

  UpdateTsConfigPaths(tree, paths => {
    paths[`${GetLibraryPathAliasName(tree, projectName)}/routes`] = [
      `${GetProjectSourceRoot(tree, projectName)}/lib/routes.ts`,
    ];
  }, { infix: 'base' });
}

function removeDefaultImportPathToBaseTsConfig(tree: Tree, projectName: string) {

  UpdateTsConfigPaths(tree, paths => {
    if (paths[`${GetLibraryPathAliasName(tree, projectName)}`]) {
      delete paths[`${GetLibraryPathAliasName(tree, projectName)}`];
    }
  }, { infix: 'base' });
}

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitFeatureLibraryGeneratorSchema) {
  console.log(`init angular library project: ${ projectName }`);

  CoerceProjectTags(project, ['feature', 'angular', 'ngx']);

  if (HasProjectPackageJson(tree, projectName)) {
    // It is required to ensure that private is set to true before calling the InitLibraryProject function
    // Is function this value will be used to determine if the library is publishable or not. And on default, a
    // feature library is only buildable and NOT publishable
    UpdateProjectPackageJson(tree, json => {
      json.private ??= true;
    }, { projectName });
  }

  await InitLibraryProject(tree, projectName, project, options);

  if (options.routes) {
    coerceRoutesEntryPoint(tree, projectName);
    addRoutesImportPathToBaseTsConfig(tree, projectName);
    removeDefaultImportPathToBaseTsConfig(tree, projectName);
  }

}
