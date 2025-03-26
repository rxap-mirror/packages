import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { LibraryInitProject } from '@rxap/plugin-library';
import {
  CoerceFile,
  CoerceIgnorePattern,
  CoerceTarget,
  GetProjectRoot,
  GetProjectSourceRoot,
  RemoveIgnorePattern,
  Strategy,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import {
  basename,
  join,
} from 'path';
import { stringify } from 'yaml';
import { InitLibraryGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {

  await LibraryInitProject(tree, projectName, project, options);

  const projectRoot = GetProjectRoot(tree, options.project);
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  const apiProjectName = basename(projectRoot);

  if (options.persistent) {
    RemoveIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib/**' ]);
  } else {
    RemoveIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib' ]);
    CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), [ 'src/lib/**' ]);
    CoerceIgnorePattern(tree, '.nxignore', [ '!/open-api/**/src/lib/**' ]);
  }

  if (project.targets?.['build']?.executor) {
    delete project.targets['build'];
  }

  if (options.external) {
    CoerceTarget(project, 'generate-open-api', {
      inputs: [join('{projectRoot}', 'src', 'openapi.yaml')],
      options: {
        path: join(projectSourceRoot, 'openapi.yaml'),
        serverId: apiProjectName
      }
    }, Strategy.OVERWRITE);
    CoerceFile(tree, join(projectSourceRoot, 'openapi.yaml'), stringify({
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0'
      },
      paths: {}
    }));
  }


  // region cleanup
  if (tree.exists(join(projectSourceRoot, 'lib', `${ options.project }.ts`))) {
    tree.delete(join(projectSourceRoot, 'lib', `${ options.project }.ts`));
  }
  if (tree.exists(join(projectSourceRoot, 'lib', `${ options.project }.spec.ts`))) {
    tree.delete(join(projectSourceRoot, 'lib', `${ options.project }.spec.ts`));
  }
  if (tree.exists(join(projectSourceRoot, 'index.ts'))) {
    let indexFileContent = tree.read(join(projectSourceRoot, 'index.ts'), 'utf-8');
    if (indexFileContent) {
      indexFileContent = indexFileContent.replace(
        new RegExp(`export \\* from './lib/${options.project}';\n`, 'g'), '');
      CoerceFile(tree, join(projectSourceRoot, 'index.ts'), indexFileContent, true);
    }
  }
  // endregion

  // region align the tsconfig.base.json
  const tsConfigBasePath = `tsconfig.base.json`;
  if (!tree.exists(tsConfigBasePath)) {
    throw new Error(`The tsconfig.base.json file does not exists in the workspace root!`);
  }
  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.paths ??= {};
    if (tsConfig.compilerOptions.paths[options.project]) {
      delete tsConfig.compilerOptions.paths[options.project];
    }
    // tsConfig.compilerOptions.paths[`${options.project}/*`] = [ `${projectSourceRoot}/lib/*` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/commands`] = [ `${projectSourceRoot}/lib/commands/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/components`] = [ `${projectSourceRoot}/lib/components/index.ts` ];
    // tsConfig.compilerOptions.paths[`${options.project}/src/lib/data-sources`] = [ `${projectSourceRoot}/lib/data-sources/index.ts` ];
    // tsConfig.compilerOptions.paths[`${options.project}/src/lib/directives`] = [ `${projectSourceRoot}/lib/directives/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/parameters`] = [ `${projectSourceRoot}/lib/parameters/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/remote-methods`] = [ `${projectSourceRoot}/lib/remote-methods/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/request-bodies`] = [ `${projectSourceRoot}/lib/request-bodies/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/responses`] = [ `${projectSourceRoot}/lib/responses/index.ts` ];
    tsConfig.compilerOptions.paths[`${options.project}/src/lib/http-resources`] = [ `${projectSourceRoot}/lib/http-resources/index.ts` ];
  }, { infix: 'base' });
  // endregion
}
