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

});
