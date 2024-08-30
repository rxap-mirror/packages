import { Tree } from '@nx/devkit';
import {
  HasProject,
  PROJECT_LOCATION_CACHE,
} from '@rxap/workspace-utilities';
import { libraryGenerator as generateJsLibrary } from '@nx/js';
import { OpenApiLibraryInitGenerator } from '@rxap/plugin-open-api';
import 'colors';

export async function coerceOpenApiClientSdkLibrary(
  tree: Tree,
  projectName: string,
) {

  const openApiProjectName = `open-api-${ projectName }`;

  if (!HasProject(tree, openApiProjectName)) {

    console.log(`Generate open api client sdk library: ${ openApiProjectName }`.blue);
    await generateJsLibrary(tree, {
      name: openApiProjectName,
      directory: `open-api/${ projectName }`,
      importPath: openApiProjectName,
      projectNameAndRootFormat: 'as-provided',
      linter: 'none',
      minimal: true,
      unitTestRunner: 'none',
      tags: 'open-api',
      buildable: true,
      publishable: false,
      bundler: 'tsc',
    });

    console.log('Initialize open api client sdk library'.blue);
    await OpenApiLibraryInitGenerator(tree, {
      project: openApiProjectName
    });

  }

}
