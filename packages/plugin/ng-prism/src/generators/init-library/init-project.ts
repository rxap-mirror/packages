import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetLibraryPathAliasName,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { InitLibraryGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init ng-prism library project: ${ projectName }`);

  const projectRoot = GetProjectRoot(tree, projectName);
  const prismProject = options.prismProject ?? 'prism-host';
  const libraryImportPath = GetLibraryPathAliasName(tree, projectName);

  const commonOptions = {
    entryPoint: projectRoot,
    prismProject,
    libraryProject: projectName,
    libraryImportPath,
  };

  project.targets ??= {};

  if (!project.targets['prism'] || options.overwrite) {
    project.targets['prism'] = {
      executor: '@ng-prism/core:serve',
      // all prism targets share one host application and its generated manifest.
      // Running them in parallel would let them overwrite the manifest of each other.
      parallelism: false,
      options: {
        ...commonOptions,
        port: options.port ?? 4400,
      },
    };
  }

  if (!project.targets['prism-build'] || options.overwrite) {
    project.targets['prism-build'] = {
      executor: '@ng-prism/core:build',
      parallelism: false,
      outputs: [ `{workspaceRoot}/dist/prism/${ projectName }` ],
      options: {
        ...commonOptions,
        outputPath: `dist/prism/${ projectName }`,
      },
    };
  }

  if (!project.targets['prism-strip'] || options.overwrite) {
    // removes the @Showcase decorators from the built package. Without it the published package would
    // import @ng-prism/core, which is not a dependency of the consumers.
    // nx:run-commands puts node_modules/.bin on the PATH, so no package manager prefix (npx, pnpm exec) is needed
    project.targets['prism-strip'] = {
      executor: 'nx:run-commands',
      dependsOn: [ 'build' ],
      options: {
        command: `ng-prism-strip dist/${ projectRoot }`,
        cwd: '{workspaceRoot}',
      },
    };
  }

}
