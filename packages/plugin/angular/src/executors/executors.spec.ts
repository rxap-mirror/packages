const tailwindBuild = jest.fn();
jest.mock('tailwindcss/lib/cli/build', () => ({ build: (...a: any[]) => tailwindBuild(...a) }), { virtual: true });

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import checkNgPackage from './check-ng-package/executor';
import configExecutor from './config/executor';
import i18nExecutor from './i18n/executor';
import tailwindExecutor from './tailwind/executor';

describe('plugin-angular executors', () => {
  let root: string;
  const env = { ...process.env };
  const cwd = process.cwd();

  function context(extra: any = {}): any {
    return {
      root,
      projectName: 'app',
      configurationName: 'production',
      target: { executor: 'x' },
      projectsConfigurations: {
        version: 2,
        projects: {
          app: {
            root: 'apps/app',
            sourceRoot: 'apps/app/src',
            targets: {
              build: {
                executor: '@angular/build:application',
                options: { outputPath: 'dist/apps/app', assets: [ 'apps/app/src/favicon.ico', { glob: '**/*', input: 'apps/app/src/assets/', output: '/assets' } ], localize: [ 'en', 'de' ] },
              },
            },
          },
        },
      },
      ...extra,
    };
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'plugin-angular-'));
    mkdirSync(join(root, 'apps/app/src/assets'), { recursive: true });
    mkdirSync(join(root, 'dist/apps/app'), { recursive: true });
    // the executors resolve project relative paths against the cwd (nx runs them in the workspace root)
    process.chdir(root);
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    for (const key of Object.keys(process.env).filter(k => k.startsWith('RXAP_CONFIG'))) {
      delete process.env[key];
    }
  });
  afterEach(() => {
    process.chdir(cwd);
    process.env = { ...env };
  });

  describe('check-ng-package', () => {
    function write(ngPackage: any, pkg: any) {
      writeFileSync(join(root, 'apps/app/ng-package.json'), JSON.stringify(ngPackage));
      writeFileSync(join(root, 'apps/app/package.json'), JSON.stringify(pkg));
    }
    it('succeeds when allowed packages are dependencies', async () => {
      write({ allowedNonPeerDependencies: [ 'a' ] }, { dependencies: { a: '1' } });
      await expect(checkNgPackage({}, context())).resolves.toEqual({ success: true });
    });
    it('succeeds without allowed list', async () => {
      write({}, { dependencies: {} });
      await expect(checkNgPackage({}, context())).resolves.toEqual({ success: true });
    });
    it('fails when an allowed package is not a dependency', async () => {
      write({ allowedNonPeerDependencies: [ 'a', 'b' ] }, { dependencies: { a: '1' } });
      await expect(checkNgPackage({}, context())).resolves.toEqual({ success: false });
    });
    it('throws when files are missing', async () => {
      await expect(checkNgPackage({}, context())).rejects.toThrow('not exists');
    });
  });

  describe('config', () => {
    it('writes an empty config when no env is set', async () => {
      await expect(configExecutor({}, context())).resolves.toEqual({ success: true });
      expect(JSON.parse(readFileSync(join(root, 'dist/apps/app/config.json'), 'utf-8')).__proto__).toBeDefined();
    });
    it('merges env config into the existing file', async () => {
      const file = join(root, 'dist/apps/app/config.json');
      writeFileSync(file, JSON.stringify({ existing: true }));
      writeFileSync(join(root, 'extra.json'), JSON.stringify({ fromFile: 1 }));
      process.env['RXAP_CONFIG'] = JSON.stringify({ merged: 1 });
      process.env['RXAP_CONFIG_API_URL'] = JSON.stringify('http://x');
      process.env['RXAP_CONFIG_FILE'] = join(root, 'extra.json');
      await configExecutor({}, context());
      const config = JSON.parse(readFileSync(file, 'utf-8'));
      expect(config).toEqual(expect.objectContaining({ existing: true, merged: 1 }));
      expect(config.api.url).toBe('http://x');
      expect(config.file).toEqual({ fromFile: 1 });
    });
    it('fails for unparsable config', async () => {
      process.env['RXAP_CONFIG_BROKEN'] = '{not-json';
      const result: any = await configExecutor({}, context());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Can not parse config');
    });
  });

  describe('tailwind', () => {
    it('passes resolved args to tailwind', async () => {
      await expect(tailwindExecutor({ input: 'in.css', output: 'out.css', config: 'tw.js', minify: true } as any, context())).resolves.toEqual({ success: true });
      expect(tailwindBuild).toHaveBeenCalledWith({
        '--input': 'apps/app/in.css', '--output': 'apps/app/out.css', '--config': 'apps/app/tw.js', '--minify': true,
      });
    });
    it('passes no args by default', async () => {
      tailwindBuild.mockClear();
      await tailwindExecutor({} as any, context());
      expect(tailwindBuild).toHaveBeenCalledWith({});
    });
  });

  describe('i18n', () => {
    const template = '<html lang="{{defaultLanguage}}">{{#each availableLanguages}}<a>{{this}}</a>{{/each}}</html>';

    it('creates the index.html from the template in the workspace root', async () => {
      writeFileSync(join(root, 'i18n.index.html.hbs'), template);
      await expect(i18nExecutor({ availableLanguages: [ 'en', 'de' ], assets: false } as any, context())).resolves.toEqual({ success: true });
      expect(readFileSync(join(root, 'dist/apps/app/index.html'), 'utf-8')).toBe('<html lang="en"><a>en</a><a>de</a></html>');
    });

    it('finds the template in shared, shared/angular and the project source root', async () => {
      for (const dir of [ 'shared', 'shared/angular', 'apps/app/src' ]) {
        mkdirSync(join(root, dir), { recursive: true });
        writeFileSync(join(root, dir, 'tpl.hbs'), template);
        await expect(i18nExecutor({ availableLanguages: [ 'en' ], indexHtmlTemplate: 'tpl.hbs' } as any, context())).resolves.toEqual({ success: true });
        writeFileSync(join(root, dir, 'tpl.hbs'), 'overwritten');
        require('fs').rmSync(join(root, dir, 'tpl.hbs'));
      }
    });

    it('fails when the template is missing', async () => {
      const result: any = await i18nExecutor({ availableLanguages: [ 'en' ] } as any, context());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not find the i18n index html template');
    });

    it('derives languages from the build target localize option and copies the build assets', async () => {
      writeFileSync(join(root, 'i18n.index.html.hbs'), template);
      writeFileSync(join(root, 'apps/app/src/favicon.ico'), 'icon');
      writeFileSync(join(root, 'apps/app/src/assets/a.txt'), 'a');
      const ctx = context();
      // the executor copies relative to cwd
      const result = await i18nExecutor({ assets: true } as any, ctx);
      expect(result).toEqual({ success: true });
      expect(readFileSync(join(root, 'dist/apps/app/index.html'), 'utf-8')).toContain('<a>de</a>');
    });

    it('copies explicit assets', async () => {
      writeFileSync(join(root, 'i18n.index.html.hbs'), template);
      writeFileSync(join(root, 'file.txt'), 'x');
      const ctx = context();
      const result: any = await i18nExecutor({ availableLanguages: [ 'en' ], assets: [ 'file.txt' ] } as any, ctx);
      expect(result.success).toBe(true);
      expect(existsSync(join('dist/apps/app/file.txt'))).toBe(true);
      const missing: any = await i18nExecutor({ availableLanguages: [ 'en' ], assets: [ 'missing.txt' ] } as any, ctx);
      expect(missing.success).toBe(false);
    });

    it('fails when the languages cannot be determined', async () => {
      const ctx = context();
      delete ctx.projectsConfigurations.projects.app.targets.build.options.localize;
      await expect(i18nExecutor({} as any, ctx)).rejects.toThrow('The available languages are not defined');
      writeFileSync(join(root, 'i18n.index.html.hbs'), template);
      await expect(i18nExecutor({ defaultLanguage: 'fr', assets: false } as any, ctx)).resolves.toEqual({ success: true });
    });

    it('skips assets without a build target in the context', async () => {
      writeFileSync(join(root, 'i18n.index.html.hbs'), template);
      const ctx = context({ target: undefined });
      const result: any = await i18nExecutor({ availableLanguages: [ 'en' ], assets: true } as any, ctx);
      expect(result.success).toBe(false);
    });
  });
});
