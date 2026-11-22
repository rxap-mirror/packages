import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type * as PluginModule from './plugin';

describe('library plugin', () => {

  let pattern: string;
  let createNodes: any;
  let normalizeOptions: typeof PluginModule.normalizeOptions;
  let root: string;
  const originalCwd = process.cwd();

  function write(file: string, content: unknown) {
    const path = join(root, file);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content));
  }

  function project(dir: string, tags: string[], packageJson: Record<string, unknown> | null = { name: `@scope/${ dir }`, publishConfig: { access: 'public' } }) {
    const name = dir.split('/').pop()!;
    write(`${ dir }/project.json`, { name, root: dir, projectType: 'library', tags, targets: { build: { executor: 'x' } } });
    write(`${ dir }/tsconfig.lib.json`, {});
    if (packageJson) {
      write(`${ dir }/package.json`, packageJson);
    }
  }

  async function targetsOf(dir: string) {
    const result: any = await createNodes([ `${ dir }/tsconfig.lib.json` ], undefined, { workspaceRoot: root } as any);
    return result[0]?.[1].projects[dir].targets;
  }

  beforeEach(() => {
    // the project location cache of the workspace utilities is global, so load a fresh module graph for each test
    jest.resetModules();
    const plugin: typeof PluginModule = require('./plugin');
    [ pattern, createNodes ] = plugin.createNodesV2 as any;
    normalizeOptions = plugin.normalizeOptions;
    root = mkdtempSync(join(tmpdir(), 'library-plugin-'));
    process.chdir(root);
    write('package.json', { name: 'ws' });
    write('nx.json', {});
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should normalize options and match tsconfig.lib.json', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(pattern).toBe('**/tsconfig.lib.json');
  });

  it('should create the default targets for a publishable library', async () => {
    project('libs/lib', []);
    write('libs/lib/GETSTARTED.md', '');
    write('libs/lib/README.md.handlebars', '');
    const targets = await targetsOf('libs/lib');
    expect(Object.keys(targets).sort()).toEqual([ 'index-export', 'readme', 'update-dependencies' ]);
    expect(targets['readme'].inputs).toEqual(expect.arrayContaining([ '{projectRoot}/GETSTARTED.md', '{projectRoot}/package.json', '{projectRoot}/README.md.handlebars' ]));
  });

  it('should create plugin targets', async () => {
    project('packages/plugin/p', [ 'plugin' ], { name: '@scope/p', publishConfig: { access: 'public' }, 'nx-migrations': {} });
    write('packages/plugin/p/generators.json', '{}');
    write('packages/plugin/p/src/generators/a/template.schema.json', '{}');
    write('packages/plugin/p/src/a.schema.json', '{}');
    const targets = await targetsOf('packages/plugin/p');
    expect(targets['check-version'].options.packageName).toBe('nx');
    expect(targets['generate-schema']).toBeDefined();
    expect(targets['index-export']).toBeUndefined();
    expect(targets['update-package-group'].dependsOn).toContain('update-dependencies');
    expect(targets['expose-as-schematic']).toBeDefined();
    expect(targets['index-json-schema']).toBeDefined();
    expect(targets['bundle-json-schema']).toBeDefined();
  });

  it.each([
    [ [ 'angular' ], '@angular/core' ],
    [ [ 'nest' ], '@nestjs/core' ],
    [ [ 'schematic' ], '@angular-devkit/schematics' ],
  ])('should create a check-version target for tags %j', async (tags, packageName) => {
    project('libs/tagged', tags);
    expect((await targetsOf('libs/tagged'))['check-version'].options.packageName).toBe(packageName);
  });

  it('should skip projects without package.json targets and root project', async () => {
    project('libs/private', [], { name: 'x', private: true });
    const targets = await targetsOf('libs/private');
    expect(targets['readme']).toBeUndefined();
    expect(targets['update-dependencies']).toBeUndefined();
    write('project.json', { name: 'ws', root: '.' });
    write('tsconfig.lib.json', {});
    expect(await createNodes([ 'tsconfig.lib.json' ], {}, { workspaceRoot: root } as any)).toEqual([]);
    expect(await createNodes([ 'unknown/tsconfig.lib.json' ], {}, { workspaceRoot: root } as any)).toEqual([]);
  });

});
