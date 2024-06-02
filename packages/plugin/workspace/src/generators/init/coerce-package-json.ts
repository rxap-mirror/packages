import { Tree } from '@nx/devkit';
import {
  CoerceArrayItems,
  CoerceSuffix,
} from '@rxap/utilities';
import {
  IsRxapRepository,
  UpdatePackageJson,
} from '@rxap/workspace-utilities';
import { determineRepositoryUrl } from './determine-repository-url';
import { InitGeneratorSchema } from './schema';

export async function coercePackageJson(tree: Tree, options: InitGeneratorSchema) {
  const repositoryUrl = await determineRepositoryUrl(tree, options);

  UpdatePackageJson(tree, packageJson => {
    packageJson.engines ??= {};
    packageJson.engines.node = '>=18 <21';
    packageJson.engines.yarn = '1.22 || 3.6';
    packageJson.os ??= [];
    packageJson.packageManager = 'yarn@3.6.0';
    CoerceArrayItems(packageJson.os, [ '!win32' ]);
    packageJson.repository = {
      type: 'git',
      url: CoerceSuffix(repositoryUrl, '.git'),
    };
    packageJson.scripts ??= {};
    packageJson.scripts['rxap:update'] = 'npx npm-check-updates --filter /@rxap/ --target newest -u && yarn';
    packageJson.scripts['rxap:migrate'] = 'yarn rxap:update && yarn rxap:compose';
    if (IsRxapRepository(tree)) {
      packageJson.scripts['rxap:compose'] = 'yarn schematic @rxap/schematic-composer:compose';
    } else {
      packageJson.scripts['rxap:compose'] = 'nx g @rxap/schematic-composer:compose';
    }
  });
}
