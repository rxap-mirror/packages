import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  Assets,
  CoerceAssets,
  CoerceFile,
  GetTarget,
  HasNgPackageJson,
  IsAngularProject,
  ReadNgPackageJson,
  WriteNgPackageJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';

/**
 * The directory (relative to the project root) the generators of an ng-packagr library are staged in.
 * It must be inside the project root: ng-packagr refuses to copy assets from outside of it.
 */
export const GENERATORS_STAGING_DIR = 'dist/generators';

function isGeneratorsAsset(asset: Assets[number]): boolean {
  return typeof asset === 'object' && (
    (asset.input ?? '').includes('src/generators') ||
    asset.glob === 'generators.json' ||
    (asset.input === GENERATORS_STAGING_DIR)
  );
}

/**
 * ng-packagr only compiles the library entry points. The generators (`src/generators/**`) and
 * `generators.json` have to be compiled/copied separately, otherwise the published package references
 * files that do not exist.
 *
 * - `build-generators` (executor `@rxap/plugin-angular:build-generators`) compiles the generators to
 *   CommonJS and stages them (with generators.json and the schema/template files) in `dist/generators`
 * - the ng-package.json asset `dist/generators` copies the staged files into the package
 * - `build` depends on `build-generators`
 */
function coerceAngularGeneratorsBuild(tree: Tree, project: ProjectConfiguration) {
  const root = project.root;

  CoerceFile(tree, join(root, 'tsconfig.generators.json'), JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      module: 'commonjs',
      moduleResolution: 'node10',
      target: 'es2021',
      lib: [ 'es2022' ],
      types: [ 'node' ],
      declaration: false,
      sourceMap: false,
      importHelpers: false,
      ignoreDeprecations: '6.0',
    },
    include: [ 'src/generators/**/*.ts' ],
    exclude: [ 'src/generators/**/*.spec.ts', 'src/generators/**/*.d.ts' ],
  }, null, 2) + '\n');

  project.targets ??= {};
  project.targets['build-generators'] ??= {
    executor: '@rxap/plugin-angular:build-generators',
    cache: true,
    inputs: [
      '{projectRoot}/src/generators/**/*',
      '{projectRoot}/generators.json',
      '{projectRoot}/tsconfig.generators.json',
      '{projectRoot}/tsconfig.json',
      '{workspaceRoot}/tsconfig.base.json',
    ],
    outputs: [ `{projectRoot}/${ GENERATORS_STAGING_DIR }` ],
    dependsOn: [],
  };

  const buildTarget = GetTarget(project, 'build');
  buildTarget.dependsOn ??= [ '^build' ];
  if (!buildTarget.dependsOn.includes('build-generators')) {
    buildTarget.dependsOn.push('build-generators');
  }

  const ngPackageJson = ReadNgPackageJson(tree, project);
  ngPackageJson.assets = (ngPackageJson.assets ?? []).filter(asset => !isGeneratorsAsset(asset));
  CoerceAssets(ngPackageJson.assets, [
    { input: GENERATORS_STAGING_DIR, glob: '**/*', output: '.' },
  ]);
  WriteNgPackageJson(tree, project, ngPackageJson);
}

function coerceTscGeneratorsBuild(project: ProjectConfiguration) {
  const root = project.root;
  const buildTarget = GetTarget(project, 'build');
  buildTarget.options ??= {};
  buildTarget.options.assets ??= [];
  buildTarget.options.assets = (buildTarget.options.assets as Assets).filter(asset => !isGeneratorsAsset(asset));
  CoerceAssets(buildTarget.options.assets, [
    {
      input: `./${ root }`,
      glob: 'generators.json',
      output: '.',
    },
    {
      // schema.json files and generator templates; the generator sources are compiled by tsc
      input: `./${ root }/src/generators`,
      glob: '**/!(*.ts|*.snap)',
      output: './src/generators',
    },
  ]);
}

/**
 * Ensures that the build of the project ships `generators.json`, the compiled generators and their
 * schema/template files.
 *
 * @param force configure the build even if `generators.json` does not exist (yet)
 */
export function CoerceGeneratorsBuild(tree: Tree, project: ProjectConfiguration, force = false) {
  if ((!force && !tree.exists(join(project.root, 'generators.json'))) || !project.targets?.['build']) {
    return;
  }

  if (IsAngularProject(project) && HasNgPackageJson(tree, project)) {
    coerceAngularGeneratorsBuild(tree, project);
  } else {
    coerceTscGeneratorsBuild(project);
  }
}
