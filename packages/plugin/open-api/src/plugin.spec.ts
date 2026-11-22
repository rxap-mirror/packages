import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createNodesV2, normalizeOptions } from './plugin';

describe('plugin-open-api nx plugin', () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'openapi-plugin-'));
  });

  function project(path: string, name: string, tags: string[]) {
    mkdirSync(join(root, path), { recursive: true });
    writeFileSync(join(root, path, 'project.json'), JSON.stringify({ name, tags }));
    writeFileSync(join(root, path, 'tsconfig.lib.json'), '{}');
  }

  it('normalizes options', () => {
    expect(normalizeOptions(undefined)).toEqual({});
  });

  it('creates targets for open-api projects', async () => {
    project('open-api/svc', 'open-api-svc', [ 'open-api' ]);
    project('services/svc', 'svc', []);
    project('open-api/static', 'open-api-static', [ 'openapi' ]);
    project('open-api/other', 'other', [ 'open-api' ]);
    project('libs/plain', 'plain', []);
    const result = await createNodesV2[1](
      [ 'open-api/svc/tsconfig.lib.json', 'open-api/static/tsconfig.lib.json', 'open-api/other/tsconfig.lib.json', 'libs/plain/tsconfig.lib.json', 'libs/none/tsconfig.lib.json' ],
      undefined,
      { workspaceRoot: root, nxJsonConfiguration: {} } as any,
    );
    const projects: any = Object.assign({}, ...result.map(([ , r ]: any) => r.projects));
    expect(Object.keys(projects).sort()).toEqual([ 'open-api/static', 'open-api/svc' ]);
    expect(projects['open-api/svc'].targets.build.executor).toBe('@nx/js:tsc');
    expect(projects['open-api/svc'].targets['generate-open-api'].options.serverId).toBe('svc');
    expect(projects['open-api/static'].targets.build).toBeUndefined();
    expect(projects['open-api/static'].targets['generate-open-api'].options.path).toBe('open-api/static/src/openapi.json');
  });
});
