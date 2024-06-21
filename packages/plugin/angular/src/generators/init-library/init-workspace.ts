import { Tree } from '@nx/devkit';
import { LibraryInitWorkspace } from '@rxap/plugin-library';
import {
  AddPackageJsonDependency,
  IsAlreadyExecuted,
} from '@rxap/workspace-utilities';
import { ANGULAR_VERSION } from '../../lib/angular-version';
import { InitLibraryGeneratorSchema } from './schema';
import { setGeneralTargetDefaults } from './set-general-target-defaults';

export async function initWorkspace(tree: Tree, options: InitLibraryGeneratorSchema) {

  if (IsAlreadyExecuted([__dirname, __filename, 'initWorkspace'].join('_'))) {
    return;
  }

  console.log('init angular library workspace');

  // must always be added as some rxap components use the i18n tag
  await AddPackageJsonDependency(tree, '@angular/localize', ANGULAR_VERSION, { soft: true });

  LibraryInitWorkspace(tree, options);

  setGeneralTargetDefaults(tree);

}
