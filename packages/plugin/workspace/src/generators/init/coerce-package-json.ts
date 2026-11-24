import { Tree } from '@nx/devkit';
import {
  CoerceArrayItems,
  CoerceSuffix,
} from '@rxap/utilities';
import {
  IsRxapRepository,
  ParsePackageManagerField,
  UpdatePackageJson,
} from '@rxap/workspace-utilities';
import { determineRepositoryUrl } from './determine-repository-url';
import { WorkspacePackageManager } from './package-manager';
import { InitGeneratorSchema } from './schema';

/**
 * The engines.yarn value older versions of this generator always wrote
 */
const LEGACY_YARN_ENGINE = '1.22 || 3.6';

export async function coercePackageJson(tree: Tree, options: InitGeneratorSchema, { profile }: WorkspacePackageManager) {
  const repositoryUrl = await determineRepositoryUrl(tree, options);

  UpdatePackageJson(tree, packageJson => {
    packageJson.engines ??= {};
    packageJson.engines.node = '>=18 <21';
    if (profile.name !== 'yarn' && packageJson.engines.yarn === LEGACY_YARN_ENGINE) {
      delete packageJson.engines.yarn;
    }
    // never pin a package manager version here, only drop a field that names another package manager
    if (packageJson.packageManager && ParsePackageManagerField(packageJson.packageManager)?.name !== profile.name) {
      console.warn(`Remove the packageManager field '${ packageJson.packageManager }', the workspace uses ${ profile.name }`);
      delete packageJson.packageManager;
    }
    packageJson.os ??= [];
    CoerceArrayItems(packageJson.os, [ '!win32' ]);
    packageJson.repository = {
      type: 'git',
      url: CoerceSuffix(repositoryUrl, '.git'),
    };
    packageJson.scripts ??= {};
    packageJson.scripts['rxap:update'] =
      `${ profile.dlx('npm-check-updates', '--filter /@rxap/ --target newest -u') } && ${ profile.install }`;
    packageJson.scripts['rxap:migrate'] = `${ profile.run('rxap:update') } && ${ profile.run('rxap:compose') }`;
    if (IsRxapRepository(tree)) {
      packageJson.scripts['rxap:compose'] = profile.run('schematic', '@rxap/schematic-composer:compose');
    } else {
      packageJson.scripts['rxap:compose'] = 'nx g @rxap/schematic-composer:compose';
    }
  });
}
