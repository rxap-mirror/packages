import { ExecutorContext } from '@nx/devkit';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import runExecutor from './executor';

describe('readme executor', () => {

  let root: string;
  let context: ExecutorContext;

  function write(file: string, content: unknown) {
    const path = join(root, 'libs/lib', file);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content));
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'readme-'));
    context = {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'lib',
      projectsConfigurations: { version: 2, projects: { lib: { root: 'libs/lib', sourceRoot: 'libs/lib/src' } } },
    } as any;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should generate a readme for a minimal package', async () => {
    write('package.json', { name: '@scope/lib', description: 'A library', version: '1.0.0' });
    expect(await runExecutor({}, context)).toEqual({ success: true });
    const readme = readFileSync(join(root, 'libs/lib/README.md'), 'utf-8');
    expect(readme).toContain('@scope/lib');
    expect(readme).toContain('A library');
  });

  it('should document generators, schematics, executors, builders and peer dependencies', async () => {
    write('package.json', {
      name: '@scope/lib',
      version: '1.0.0',
      generators: './generators.json',
      schematics: './collection.json',
      executors: './executors.json',
      builders: './builders.json',
      peerDependencies: { rxjs: '^7.0.0' },
    });
    write('GETSTARTED.md', 'GET STARTED CONTENT');
    write('GUIDES.md', 'GUIDES CONTENT');
    write('generators.json', { generators: {
      init: { factory: './a', schema: './src/generators/init/schema.json', description: 'Init it' },
      config: { factory: './a', schema: './src/generators/config/schema.json', description: 'Config it' },
      nofile: { factory: './a', schema: './src/generators/nofile/schema.json' },
    } });
    write('collection.json', { schematics: {
      init: { factory: './a', schema: './src/generators/init/schema.json' },
      legacy: { factory: './a', schema: './src/generators/legacy/schema.json', description: 'Legacy' },
    } });
    write('executors.json', { executors: { build: { implementation: './a', schema: './src/executors/build/schema.json', description: 'Build it' } } });
    write('builders.json', { builders: { legacyBuild: { implementation: './a', schema: './src/executors/legacy/schema.json' }, build: { schema: './src/executors/build/schema.json' } } });
    write('src/generators/init/schema.json', { $id: 'Init', properties: { skipFormat: { type: 'boolean', description: 'Skip' } } });
    write('src/generators/config/schema.json', {
      $id: 'Config',
      allOf: [ { properties: { a: { type: 'string' } }, required: [ 'a' ] }, { properties: { b: { type: 'string' } } } ],
    });
    write('src/generators/legacy/schema.json', { $id: 'Legacy' });
    write('src/executors/build/schema.json', { $id: 'Build', properties: { x: { type: 'string' } } });
    write('src/executors/legacy/schema.json', { $id: 'LegacyBuild' });
    expect(await runExecutor({}, context)).toEqual({ success: true });
    const readme = readFileSync(join(root, 'libs/lib/README.md'), 'utf-8');
    expect(readme).toContain('GET STARTED CONTENT');
    expect(readme).toContain('GUIDES CONTENT');
    expect(readme).toContain('rxjs');
    expect(readme).toContain('Init it');
    expect(readme).toContain('legacy');
    expect(readme).toContain('Build it');
    expect(readme).not.toContain('nofile');
  });

  it('should use a custom template and report template errors', async () => {
    write('package.json', { name: '@scope/lib' });
    write('README.md.handlebars', 'custom {{packageJson.name}}');
    expect(await runExecutor({}, context)).toEqual({ success: true });
    expect(readFileSync(join(root, 'libs/lib/README.md'), 'utf-8')).toBe('custom @scope/lib');
    write('README.md.handlebars', '{{#unknownHelperBlock}}{{/unknownHelperBlock}}{{> missingPartial}}');
    expect(await runExecutor({}, context)).toEqual({ success: false });
  });

});
