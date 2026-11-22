import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createNodesV2 as application, normalizeOptions as normalizeApplication } from './application';
import { createNodesV2 as i18n } from './i18n';
import { createNodesV2 as library, normalizeOptions as normalizeLibrary } from './library';

describe('plugin-angular nx plugins', () => {
  // the project location cache of the workspace utilities is global, so all projects live in one workspace
  let root: string;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'angular-plugin-'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'workspace' }));
    project('apps/a', [ 'tsconfig.app.json', 'i18n.index.html.hbs' ]);
    project('libs/a', [ 'ng-package.json', 'tailwind.config.js' ]);
    project('libs/b', [ 'ng-package.json' ]);
  });

  function project(path: string, files: string[] = []) {
    mkdirSync(join(root, path), { recursive: true });
    writeFileSync(join(root, path, 'project.json'), JSON.stringify({ name: path }));
    for (const f of files) {
      mkdirSync(join(root, path, f, '..'), { recursive: true });
      writeFileSync(join(root, path, f), '{}');
    }
  }

  const context = (): any => ({ workspaceRoot: root, nxJsonConfiguration: {} });

  it('normalizes options', () => {
    expect(normalizeApplication(undefined)).toEqual({});
    expect(normalizeLibrary({})).toEqual({});
  });

  it('application plugin adds the config target to known projects', async () => {
    expect(application[0]).toContain('tsconfig.app.json');
    const result = await application[1]([ 'apps/a/tsconfig.app.json', 'apps/unknown/tsconfig.app.json' ], undefined, context());
    expect(result).toHaveLength(1);
    expect((result[0][1] as any).projects['apps/a'].targets.config.executor).toBe('@rxap/plugin-angular:config');
  });

  it('i18n plugin adds the i18n-index-html target', async () => {
    expect(i18n[0]).toContain('i18n.index.html.hbs');
    const result = await i18n[1]([ 'apps/a/i18n.index.html.hbs' ], {}, context());
    expect((result[0][1] as any).projects['apps/a'].targets['i18n-index-html'].executor).toBe('@rxap/plugin-application:i18n');
  });

  it('library plugin adds check-ng-package and build-tailwind targets', async () => {
    const cwd = process.cwd();
    process.chdir(root);
    try {
      const result = await library[1]([ 'libs/a/ng-package.json', 'libs/b/ng-package.json', 'libs/none/ng-package.json' ], undefined, context());
      const projects: any = Object.assign({}, ...result.map(([ , r ]: any) => r.projects));
      expect(Object.keys(projects).sort()).toEqual([ 'libs/a', 'libs/b' ]);
      expect(projects['libs/a'].targets['check-ng-package'].executor).toBe('@rxap/plugin-angular:check-ng-package');
      expect(projects['libs/a'].targets['build-tailwind'].executor).toBe('@rxap/plugin-angular:tailwind');
      expect(projects['libs/b'].targets['build-tailwind']).toBeUndefined();
    } finally {
      process.chdir(cwd);
    }
  });
});
