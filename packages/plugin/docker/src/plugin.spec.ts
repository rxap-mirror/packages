import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createNodesV2, normalizeOptions } from './plugin';

describe('plugin-docker nx plugin', () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'docker-plugin-'));
  });

  function project(path: string, files: Record<string, string>, config: any = { name: path }) {
    mkdirSync(join(root, path, 'src'), { recursive: true });
    writeFileSync(join(root, path, 'project.json'), JSON.stringify(config));
    for (const [ f, c ] of Object.entries(files)) {
      writeFileSync(join(root, path, f), c);
    }
  }

  it('normalizes options', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(normalizeOptions({})).toEqual({});
  });

  it('exposes glob patterns', () => {
    expect(createNodesV2[0]).toContain('Dockerfile');
  });

  it('creates docker targets for projects with a Dockerfile', async () => {
    project('apps/a', { Dockerfile: 'FROM x' });
    project('apps/b', { 'src/Dockerfile': 'FROM x' });
    project('apps/c', {}, { name: 'c' });
    const result = await createNodesV2[1](
      [ 'apps/a/Dockerfile', 'apps/b/src/Dockerfile', 'apps/c/tsconfig.app.json', 'missing/Dockerfile' ],
      {},
      { workspaceRoot: root, nxJsonConfiguration: {} } as any,
    );
    const projects: any = Object.assign({}, ...result.map(([ , r ]: any) => r.projects));
    expect(projects['apps/a'].targets.docker.options).toEqual({ dockerfile: 'Dockerfile' });
    expect(projects['apps/a'].targets['docker-save'].executor).toBe('@rxap/plugin-docker:save');
    expect(Object.keys(projects).length).toBeGreaterThanOrEqual(1);
  });
});
