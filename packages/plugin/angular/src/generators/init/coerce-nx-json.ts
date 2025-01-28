import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { CoerceNxJsonGenerators } from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function coerceNxJson(tree: Tree, options: InitGeneratorSchema) {
  const nxJson = readNxJson(tree)!;

  CoerceNxJsonGenerators(nxJson, '@nx/angular:application', {
    'style': 'scss',
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'e2eTestRunner': 'none',
    'tags': 'angular,ngx',
    'prefix': options.prefix ?? 'rxap',
    'standalone': true,
    'addTailwind': true,
    'routing': true,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:host', {
    'style': 'scss',
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'e2eTestRunner': 'none',
    'tags': 'angular,ngx',
    'prefix': options.prefix ?? 'rxap',
    'standalone': true,
    'addTailwind': true,
    name: 'shell',
    'directory': `user-interface/shell`,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:remote', {
    'style': 'scss',
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'e2eTestRunner': 'none',
    'tags': 'angular,ngx',
    'prefix': options.prefix ?? 'rxap',
    'standalone': true,
    'addTailwind': true,
    host: 'shell',
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:component', {
    'style': 'scss',
    'standalone': true,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:library', {
    'linter': 'eslint',
    'unitTestRunner': 'jest',
    'publishable': false,
    'addTailwind': false,
    'changeDetection': 'OnPush',
    'standalone': true,
    'style': 'scss',
    'tags': 'angular,ngx',
    'prefix': 'rxap',
    'skipModule': true,
    buildable: false,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:directive', {
    'standalone': true,
    'skipTests': true,
  });
  CoerceNxJsonGenerators(nxJson, '@nx/angular:library-secondary-entry-point', {
    'skipModule': true,
  });

  updateNxJson(tree, nxJson);
}
