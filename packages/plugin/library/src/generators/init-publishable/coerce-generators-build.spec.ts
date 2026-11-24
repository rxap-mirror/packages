import { ProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { CoerceGeneratorsBuild } from './coerce-generators-build';

describe('CoerceGeneratorsBuild', () => {
  function angularProject(tree: ReturnType<typeof createTreeWithEmptyWorkspace>): ProjectConfiguration {
    tree.write('packages/angular/lib/generators.json', '{"generators":{}}');
    tree.write('packages/angular/lib/ng-package.json', JSON.stringify({
      assets: [
        'README.md',
        { input: './packages/angular/lib/src/generators', glob: '**/!(*.ts|*.js|*.json)', output: './src/generators' },
        { input: './packages/angular/lib', glob: 'generators.json', output: '.' },
      ],
    }));
    return {
      root: 'packages/angular/lib',
      tags: [ 'angular' ],
      targets: { build: { executor: '@nx/angular:package', dependsOn: [ '^build' ] } },
    };
  }

  it('does nothing for projects without generators.json', () => {
    const tree = createTreeWithEmptyWorkspace();
    const project: ProjectConfiguration = { root: 'packages/lib', targets: { build: { executor: '@nx/js:tsc' } } };
    CoerceGeneratorsBuild(tree, project);
    expect(project.targets!['build'].options).toBeUndefined();
  });

  it('adds the build-generators target, the staging asset and the tsconfig for ng-packagr libraries', () => {
    const tree = createTreeWithEmptyWorkspace();
    const project = angularProject(tree);
    CoerceGeneratorsBuild(tree, project);
    CoerceGeneratorsBuild(tree, project); // idempotent

    expect(project.targets!['build-generators'].executor).toBe('@rxap/plugin-angular:build-generators');
    expect(project.targets!['build-generators'].outputs).toEqual([ '{projectRoot}/dist/generators' ]);
    expect(project.targets!['build'].dependsOn).toEqual([ '^build', 'build-generators' ]);
    expect(JSON.parse(tree.read('packages/angular/lib/ng-package.json', 'utf-8')!).assets).toEqual([
      'README.md',
      { input: 'dist/generators', glob: '**/*', output: '.' },
    ]);
    expect(JSON.parse(tree.read('packages/angular/lib/tsconfig.generators.json', 'utf-8')!).compilerOptions.module).toBe('commonjs');
  });

  it('adds the generators.json and schema assets to the tsc build of other libraries', () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('packages/nest/lib/generators.json', '{"generators":{}}');
    const project: ProjectConfiguration = {
      root: 'packages/nest/lib',
      tags: [ 'nest' ],
      targets: { build: { executor: '@nx/js:tsc', options: { assets: [ 'packages/nest/lib/*.md' ] } } },
    };
    CoerceGeneratorsBuild(tree, project);
    CoerceGeneratorsBuild(tree, project);

    expect(project.targets!['build'].options.assets).toEqual([
      'packages/nest/lib/*.md',
      { input: './packages/nest/lib', glob: 'generators.json', output: '.' },
      { input: './packages/nest/lib/src/generators', glob: '**/!(*.ts|*.snap)', output: './src/generators' },
    ]);
    expect(project.targets!['build-generators']).toBeUndefined();
  });
});
