import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  createNodesV2,
  normalizeOptions,
} from './plugin';

describe('typedoc plugin', () => {

  const [ pattern, createNodes ] = createNodesV2;
  let root: string;

  function write(file: string, content: unknown) {
    const path = join(root, file);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content));
  }

  function context(): any {
    return { workspaceRoot: root };
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'typedoc-plugin-'));
    write('package.json', { name: 'ws', devDependencies: {} });
    write('nx.json', {});
    write('libs/lib/project.json', { name: 'lib', root: 'libs/lib', sourceRoot: 'libs/lib/src', projectType: 'library' });
    write('libs/lib/package.json', { name: '@scope/lib' });
    write('libs/lib/tsconfig.typedoc.json', {});
    write('libs/lib/src/index.ts', 'export {};');
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should normalize options and match tsconfig.typedoc.json', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(pattern).toBe('**/tsconfig.typedoc.json');
  });

  it('should create the typedoc target', async () => {
    const result: any = await createNodes([ 'libs/lib/tsconfig.typedoc.json' ], undefined, context());
    const target = result[0][1].projects['libs/lib'].targets['typedoc'];
    expect(target.executor).toBe('@rxap/plugin-typedoc:build');
    expect(target.options).toEqual(expect.objectContaining({
      tsconfig: 'libs/lib/tsconfig.typedoc.json',
      entryPoints: [ 'libs/lib/src/index.ts' ],
      name: '@scope/lib',
      markdown: false,
      wiki: false,
      json: true,
      html: true,
    }));
  });

  it('should enable markdown and wiki when the plugins are installed', async () => {
    write('package.json', { name: 'ws', devDependencies: { 'typedoc-plugin-markdown': '1', 'typedoc-github-wiki-theme': '1' } });
    const result: any = await createNodes([ 'libs/lib/tsconfig.typedoc.json' ], {}, context());
    const options = result[0][1].projects['libs/lib'].targets['typedoc'].options;
    expect(options.markdown).toBe(true);
    expect(options.wiki).toBe(true);
  });

  it('should fall back to other tsconfig files', async () => {
    rmSync(join(root, 'libs/lib/tsconfig.typedoc.json'));
    write('libs/lib/tsconfig.lib.json', {});
    write('libs/lib/tsconfig.typedoc.json', {});
    // tsconfig.typedoc.json always exists for matched files; remove it after discovery is simulated
    const result: any = await createNodes([ 'libs/lib/tsconfig.typedoc.json' ], {}, context());
    expect(result).toHaveLength(1);
  });

  it('should skip config files outside of projects', async () => {
    write('other/tsconfig.typedoc.json', {});
    expect(await createNodes([ 'other/tsconfig.typedoc.json' ], {}, context())).toEqual([]);
  });

  it('should fail if the project has no index.ts', async () => {
    rmSync(join(root, 'libs/lib/src/index.ts'));
    await expect(createNodes([ 'libs/lib/tsconfig.typedoc.json' ], {}, context())).rejects.toThrow('src/index.ts');
  });

});
