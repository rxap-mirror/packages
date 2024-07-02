import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceFile,
  ForEachSecondaryEntryPoint,
} from '@rxap/workspace-utilities';
import {
  dirname,
  join,
  relative,
} from 'path';

export function checkIfSecondaryEntrypointIncludeInTheTsConfig(tree: Tree, project: ProjectConfiguration) {
  const projectRoot = project.root;
  const libTsConfigPath = join(projectRoot, 'tsconfig.lib.json');
  const specTsConfigPath = join(projectRoot, 'tsconfig.spec.json');
  const libTsConfig = tree.exists(libTsConfigPath) ? JSON.parse(tree.read(libTsConfigPath)!.toString('utf-8')) : null;
  const specTsConfig = tree.exists(specTsConfigPath) ? JSON.parse(tree.read(specTsConfigPath)!.toString('utf-8')) :
                       null;
  for (const path of ForEachSecondaryEntryPoint(tree, projectRoot)) {
    const folder = dirname(path);
    const entryPoint = relative(projectRoot, folder);
    if (entryPoint) {
      if (libTsConfig) {
        libTsConfig.include ??= [];
        if (!libTsConfig.include.includes(`${ entryPoint }/**/*.ts`)) {
          libTsConfig.include.push(`${ entryPoint }/**/*.ts`);
        }
      }
      if (specTsConfig) {
        specTsConfig.include ??= [];
        if (!specTsConfig.include.includes(`${ entryPoint }/**/*.spec.ts`)) {
          specTsConfig.include.push(`${ entryPoint }/**/*.spec.ts`);
        }
      }
    }
  }
  if (libTsConfig) {
    CoerceFile(tree, libTsConfigPath, JSON.stringify(libTsConfig, null, 2), true);
  }
  if (specTsConfig) {
    CoerceFile(tree, specTsConfigPath, JSON.stringify(specTsConfig, null, 2), true);
  }
}
