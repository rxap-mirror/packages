import { Tree } from '@nx/devkit';
import { HasProject } from '@rxap/workspace-utilities';

export function assertOpenApiClientSdkLibrary(
  tree: Tree,
  projectName: string,
) {

  const openApiProjectName = `open-api-${ projectName }`;

  if (!HasProject(tree, openApiProjectName)) {

    // TODO : run the commands on the fly instead of throwing an error

    console.log('Use the command: ' +
                `nx g @nx/js:library --name ${ openApiProjectName } --directory open-api/${ projectName } --importPath ${ openApiProjectName } --projectNameAndRootFormat as-provided --linter none --minimal --unitTestRunner none --tags open-api --no-publishable --bundler none`.blue);
    console.log('Use the command: ' + `nx g @rxap/plugin-open-api:init-library --project ${ openApiProjectName }`.blue);
    throw new Error(`Can't create open api client sdk library for project ${ projectName }`);

  }

}
