import { ExecutorContext } from '@nx/devkit';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import runExecutor from './executor';

describe('i18n executor', () => {

  let root: string;
  const originalCwd = process.cwd();
  let buildOptions: Record<string, any>;

  function context(): ExecutorContext {
    return {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'app',
      target: { executor: 'x' },
      projectsConfigurations: {
        version: 2,
        projects: {
          app: {
            root: 'apps/app',
            sourceRoot: 'apps/app/src',
            targets: { build: { executor: 'x', options: buildOptions } },
          },
        },
      },
    } as any;
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'i18n-'));
    mkdirSync(join(root, 'dist/app'), { recursive: true });
    mkdirSync(join(root, 'apps/app/src'), { recursive: true });
    writeFileSync(join(root, 'i18n.index.html.hbs'), '<html>{{defaultLanguage}}:{{#each availableLanguages}}{{this}},{{/each}}</html>');
    buildOptions = { outputPath: 'dist/app', localize: [ 'en', 'de' ] };
    process.chdir(root);
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should render index.html using the localize build option', async () => {
    const result = await runExecutor({}, context());
    expect(result.success).toBe(true);
    expect(readFileSync(join(root, 'dist/app/index.html'), 'utf-8')).toBe('<html>en:en,de,</html>');
  });

  it('should use explicit languages and warn when index.html exists', async () => {
    writeFileSync(join(root, 'dist/app/index.html'), 'old');
    const result = await runExecutor({ availableLanguages: [ 'fr' ], defaultLanguage: 'fr' }, context());
    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalled();
    expect(readFileSync(join(root, 'dist/app/index.html'), 'utf-8')).toBe('<html>fr:fr,</html>');
  });

  it('should fall back to the default language when localize is missing', async () => {
    delete buildOptions['localize'];
    const result = await runExecutor({ defaultLanguage: 'it' }, context());
    expect(result.success).toBe(true);
    expect(readFileSync(join(root, 'dist/app/index.html'), 'utf-8')).toBe('<html>it:it,</html>');
  });

  it('should throw if no languages are available', async () => {
    delete buildOptions['localize'];
    await expect(runExecutor({}, context())).rejects.toThrow('available languages');
  });

  it('should fail if the template can not be found', async () => {
    const result: any = await runExecutor({ indexHtmlTemplate: 'missing.hbs' }, context());
    expect(result.success).toBe(false);
    expect(result.error).toContain('missing.hbs');
  });

  it('should find the template in shared and shared/angular', async () => {
    rmSync(join(root, 'i18n.index.html.hbs'));
    mkdirSync(join(root, 'shared/angular'), { recursive: true });
    writeFileSync(join(root, 'shared/angular/i18n.index.html.hbs'), 'A{{defaultLanguage}}');
    expect((await runExecutor({}, context())).success).toBe(true);
    expect(readFileSync(join(root, 'dist/app/index.html'), 'utf-8')).toBe('Aen');
    writeFileSync(join(root, 'shared/i18n.index.html.hbs'), 'S{{defaultLanguage}}');
    await runExecutor({}, context());
    expect(readFileSync(join(root, 'dist/app/index.html'), 'utf-8')).toBe('Sen');
    rmSync(join(root, 'shared'), { recursive: true });
    writeFileSync(join(root, 'apps/app/src/i18n.index.html.hbs'), 'P{{defaultLanguage}}');
    await runExecutor({}, context());
    expect(readFileSync(join(root, 'dist/app/index.html'), 'utf-8')).toBe('Pen');
  });

  it('should copy explicit assets', async () => {
    const asset = join(root, 'asset.txt');
    writeFileSync(asset, 'x');
    const result = await runExecutor({ assets: [ asset ] }, context());
    expect(result.success).toBe(true);
    expect(existsSync(join(root, 'dist/app/asset.txt'))).toBe(true);
  });

  it('should copy assets of the build target when assets is true', async () => {
    const asset = join(root, 'asset2.txt');
    writeFileSync(asset, 'x');
    buildOptions['assets'] = [ asset ];
    const result = await runExecutor({ assets: true }, context());
    expect(result.success).toBe(true);
    expect(existsSync(join(root, 'dist/app/asset2.txt'))).toBe(true);
  });

  it('should skip assets if the build target has none', async () => {
    const result = await runExecutor({ assets: true }, context());
    expect(result.success).toBe(true);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Skip assets copy'));
  });

  it('should copy glob assets', async () => {
    mkdirSync(join(root, 'assets-src'));
    writeFileSync(join(root, 'assets-src/a.txt'), 'a');
    const result = await runExecutor({
      assets: [ { glob: '/*.txt', input: join(root, 'assets-src'), output: 'assets' } as any ],
    }, context());
    expect(result.success).toBe(true);
    expect(existsSync(join(root, 'dist/app/assets/a.txt'))).toBe(true);
  });

  it('should fail when an asset can not be copied', async () => {
    const result: any = await runExecutor({ assets: [ join(root, 'nope') ] }, context());
    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not copy assets');
  });

});
