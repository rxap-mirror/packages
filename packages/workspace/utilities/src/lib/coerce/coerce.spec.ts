import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { CoerceNxJsonCacheableOperation } from './coerce-nx-json-cacheable-operation';
import { CoerceNxJsonGenerators } from './coerce-nx-json-generators';
import { CoerceNxJsonNamedInputs } from './coerce-nx-json-named-inputs';
import { CoerceNxPlugin } from './coerce-nx-plugin';
import { CoerceTargetDefaults } from './coerce-target-defaults';
import { CoerceTargetDefaultsDependency } from './coerce-target-defaults-dependency';
import {
  CoerceTargetDefaultsInput,
  IsEnvInputDefinition,
  IsRuntimeInputDefinition,
} from './coerce-target-defaults-input';
import { CoerceTargetDefaultsOutput } from './coerce-target-defaults-output';
import { coerceIdeaExcludeFolders } from './coerce-idea-exclude-folders';
import { Strategy } from './coerce-target';

describe('CoerceNxJsonCacheableOperation', () => {
  it('marks targets as cacheable', () => {
    const nx: any = {};
    CoerceNxJsonCacheableOperation(nx, 'build', 'test');
    expect(nx.targetDefaults).toEqual({ build: { cache: true }, test: { cache: true } });
  });
});

describe('CoerceNxJsonGenerators', () => {
  it.each([
    [Strategy.DEFAULT, { a: 1, b: { c: 1 } }],
    [Strategy.OVERWRITE, { a: 2, b: { c: 1, d: 2 } }],
    [Strategy.MERGE, { a: 1, b: { c: 1, d: 2 } }],
    [Strategy.REPLACE, { a: 2, b: { d: 2 } }],
  ])('applies the %s strategy', (strategy, expected) => {
    const nx: any = { generators: { g: { a: 1, b: { c: 1 } } } };
    CoerceNxJsonGenerators(nx, 'g', { a: 2, b: { d: 2 } }, strategy);
    expect(nx.generators.g).toEqual(expected);
  });

  it('creates the generator entry', () => {
    const nx: any = {};
    CoerceNxJsonGenerators(nx, 'g', { a: 1 });
    expect(nx.generators).toEqual({ g: { a: 1 } });
  });
});

describe('CoerceNxJsonNamedInputs', () => {
  it('only sets missing inputs by default', () => {
    const nx: any = { namedInputs: { a: ['x'] } };
    CoerceNxJsonNamedInputs(nx, 'a', ['y']);
    CoerceNxJsonNamedInputs(nx, 'b', ['y']);
    expect(nx.namedInputs).toEqual({ a: ['x'], b: ['y'] });
  });

  it.each([Strategy.OVERWRITE, Strategy.MERGE, Strategy.REPLACE])('replaces for %s', (strategy) => {
    const nx: any = {};
    CoerceNxJsonNamedInputs(nx, 'a', ['y'], strategy);
    expect(nx.namedInputs.a).toEqual(['y']);
  });
});

describe('CoerceNxPlugin', () => {
  it('adds plugin entry points without duplicates', () => {
    const nx: any = {};
    CoerceNxPlugin(nx, '@nx/jest/plugin');
    CoerceNxPlugin(nx, '@nx/jest/plugin');
    expect(nx.plugins).toEqual(['@nx/jest/plugin']);
  });

  it('adds expanded plugin configurations and compares by plugin name', () => {
    const nx: any = { plugins: ['@nx/eslint/plugin'] };
    CoerceNxPlugin(nx, '@nx/eslint/plugin', { a: 1 });
    CoerceNxPlugin(nx, '@nx/vite/plugin', { targetName: 'v' }, ['a'], ['b']);
    CoerceNxPlugin(nx, '@nx/vite/plugin', {});
    expect(nx.plugins).toEqual(['@nx/eslint/plugin', { plugin: '@nx/vite/plugin', options: { targetName: 'v' }, include: ['a'], exclude: ['b'] }]);
  });
});

describe('CoerceTargetDefaults', () => {
  const target = { executor: 'x', options: { a: 2 } };
  it('sets the target when missing', () => {
    const nx: any = {};
    CoerceTargetDefaults(nx, 'build', target);
    expect(nx.targetDefaults.build).toEqual(target);
  });

  it.each([
    [Strategy.DEFAULT, { options: { a: 1, b: 1 } }],
    [Strategy.OVERWRITE, { options: { a: 2, b: 1 }, executor: 'x' }],
    [Strategy.MERGE, { options: { a: 1, b: 1 }, executor: 'x' }],
    [Strategy.REPLACE, target],
  ])('applies %s', (strategy, expected) => {
    const nx: any = { targetDefaults: { build: { options: { a: 1, b: 1 } } } };
    CoerceTargetDefaults(nx, 'build', target, strategy);
    expect(nx.targetDefaults.build).toEqual(expected);
  });
});

describe('target defaults lists', () => {
  it('coerces dependsOn without duplicates', () => {
    const nx: any = {};
    CoerceTargetDefaultsDependency(nx, 'build', '^build', { target: 'x', projects: 'y' });
    CoerceTargetDefaultsDependency(nx, 'build', '^build', { target: 'x', projects: 'y' }, 'z');
    expect(nx.targetDefaults.build.dependsOn).toEqual(['^build', { target: 'x', projects: 'y' }, 'z']);
  });

  it('coerces outputs without duplicates', () => {
    const nx: any = {};
    CoerceTargetDefaultsOutput(nx, 'build', 'a', 'b');
    CoerceTargetDefaultsOutput(nx, 'build', 'b', 'c');
    expect(nx.targetDefaults.build.outputs).toEqual(['a', 'b', 'c']);
  });

  it('coerces inputs of every supported kind', () => {
    const nx: any = {};
    CoerceTargetDefaultsInput(nx, 'build', 'default', { env: 'A' }, { runtime: 'node -v' });
    CoerceTargetDefaultsInput(nx, 'build', 'default', { env: 'A' }, { env: 'B' }, { runtime: 'node -v' }, { runtime: 'x' });
    expect(nx.targetDefaults.build.inputs).toEqual([
      'default', { env: 'A' }, { runtime: 'node -v' }, { env: 'B' }, { runtime: 'x' },
    ]);
  });

  it('rejects unsupported input definitions', () => {
    expect(() => CoerceTargetDefaultsInput({}, 'build', { fileset: 'x' })).toThrow('Not yet implemented');
  });

  it('detects env and runtime input definitions', () => {
    expect(IsEnvInputDefinition({ env: 'A' })).toBe(true);
    expect(IsEnvInputDefinition('a')).toBe(false);
    expect(IsRuntimeInputDefinition({ runtime: 'a' })).toBe(true);
    expect(IsRuntimeInputDefinition({ fileset: 'a' })).toBe(false);
  });
});

describe('coerceIdeaExcludeFolders', () => {
  const iml = `<?xml version="1.0" encoding="UTF-8"?>
<module type="WEB_MODULE" version="4">
  <component name="NewModuleRootManager">
    <content url="file://$MODULE_DIR$">
      <excludeFolder url="file://$MODULE_DIR$/dist" />
    </content>
  </component>
</module>`;

  it('adds missing exclude folders to iml files', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('.idea/project.iml', iml);
    tree.write('.idea/other.xml', '<x/>');
    await coerceIdeaExcludeFolders(tree, ['dist', '/tmp']);
    const result = tree.read('.idea/project.iml', 'utf-8')!;
    expect(result.match(/\/dist"/g)).toHaveLength(1);
    expect(result).toContain('file://$MODULE_DIR$/tmp');
  });

  it('logs and swallows errors', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('.idea/project.iml', '<module><component/></module>');
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    await expect(coerceIdeaExcludeFolders(tree, ['dist'])).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith('error updating exclude folders in .idea/*.iml', expect.any(String));
    log.mockRestore();
  });
});
