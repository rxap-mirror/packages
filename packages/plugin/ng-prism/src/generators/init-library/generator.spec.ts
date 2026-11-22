import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { initLibraryGenerator } from './generator';

describe('init-library generator', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write('libs/ui/package.json', JSON.stringify({ name: '@acme/ui' }));
    tree.write('libs/ui/src/lib/button.component.ts', '@Component({}) export class ButtonComponent {}');
    addProjectConfiguration(tree, 'ui', {
      root: 'libs/ui',
      sourceRoot: 'libs/ui/src',
      projectType: 'library',
      tags: [ 'angular' ],
      targets: {},
    });
  });

  it('should create the shared host application and the library targets', async () => {
    await initLibraryGenerator(tree, { project: 'ui', skipFormat: true });

    const host = readProjectConfiguration(tree, 'prism-host');
    expect(host.projectType).toBe('application');
    expect(host.tags).toEqual([ 'prism' ]);
    expect(tree.exists('ng-prism.config.ts')).toBe(true);
    expect(tree.read('.gitignore', 'utf-8')).toContain('ng-prism-cache');
    expect(readJson(tree, 'tsconfig.base.json').compilerOptions.paths['prism-manifest/*']).toBeDefined();

    const ui = readProjectConfiguration(tree, 'ui');
    expect(ui.targets?.['prism']?.options).toMatchObject({
      entryPoint: 'libs/ui',
      prismProject: 'prism-host',
      libraryProject: 'ui',
      libraryImportPath: '@acme/ui',
    });
    expect(ui.targets?.['prism']?.parallelism).toBe(false);
    expect(ui.targets?.['prism-build']?.parallelism).toBe(false);
    expect(ui.targets?.['prism-strip']?.options.command).toBe('npx ng-prism-strip dist/libs/ui');
  });

  it('should be idempotent and keep existing targets', async () => {
    await initLibraryGenerator(tree, { project: 'ui', skipFormat: true });
    const before = readProjectConfiguration(tree, 'ui');
    before.targets!['prism'].options.port = 4500;
    tree.write('libs/ui/project.json', JSON.stringify(before));

    await initLibraryGenerator(tree, { project: 'ui', skipFormat: true });

    expect(readProjectConfiguration(tree, 'ui').targets?.['prism']?.options.port).toBe(4500);
  });

  it('should collect the prism providers of all libraries in the host application', async () => {
    tree.write('libs/ui/prism/providers.ts', 'export const PRISM_PROVIDERS = [];');

    await initLibraryGenerator(tree, { project: 'ui', skipFormat: true });

    const libraryProviders = tree.read('apps/prism-host/src/library-providers.ts', 'utf-8');
    expect(libraryProviders).toContain(`import { PRISM_PROVIDERS as UI_PROVIDERS } from '../../../libs/ui/prism/providers';`);
    expect(libraryProviders).toContain('...UI_PROVIDERS,');
    expect(tree.read('apps/prism-host/src/providers.ts', 'utf-8')).toContain('...PRISM_LIBRARY_PROVIDERS');
  });

  it('should create an empty library providers file without prism providers', async () => {
    await initLibraryGenerator(tree, { project: 'ui', skipFormat: true });

    expect(tree.read('apps/prism-host/src/library-providers.ts', 'utf-8'))
      .toContain('export const PRISM_LIBRARY_PROVIDERS: Array<Provider | EnvironmentProviders> = [];');
  });

  it('should skip libraries without components', async () => {
    tree.write('libs/utils/package.json', JSON.stringify({ name: '@acme/utils' }));
    tree.write('libs/utils/src/index.ts', 'export const a = 1;');
    addProjectConfiguration(tree, 'utils', {
      root: 'libs/utils',
      sourceRoot: 'libs/utils/src',
      projectType: 'library',
      tags: [ 'angular' ],
      targets: {},
    });

    await initLibraryGenerator(tree, { skipFormat: true });

    expect(readProjectConfiguration(tree, 'utils').targets?.['prism']).toBeUndefined();
    expect(readProjectConfiguration(tree, 'ui').targets?.['prism']).toBeDefined();
  });

  it('should configure the host application for material and tailwind components', async () => {
    await initLibraryGenerator(tree, { project: 'ui', skipFormat: true });

    expect(tree.read('apps/prism-host/src/providers.ts', 'utf-8')).toContain('provideAnimationsAsync()');
    expect(tree.read('apps/prism-host/src/styles.scss', 'utf-8')).toContain('mat.theme(');
    expect(tree.read('apps/prism-host/src/index.html', 'utf-8')).toContain('Material+Icons');
    expect(tree.read('apps/prism-host/tailwind.config.js', 'utf-8')).toContain(`'../../libs/**/src/**/`);
    expect(readProjectConfiguration(tree, 'prism-host').targets?.['build']?.options.styles)
      .toContain('apps/prism-host/src/styles.scss');
  });

});
