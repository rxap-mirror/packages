import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createNodesV2, normalizeOptions } from './plugin';

describe('plugin-n8n nx plugin', () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'n8n-plugin-'));
  });

  function project(path: string, tags: string[], nodeJson: boolean) {
    mkdirSync(join(root, path, 'src', 'lib'), { recursive: true });
    writeFileSync(join(root, path, 'project.json'), JSON.stringify({ name: path, tags }));
    writeFileSync(join(root, path, 'tsconfig.lib.json'), '{}');
    if (nodeJson) {
      writeFileSync(join(root, path, 'src', 'lib', 'A.node.json'), '{}');
    }
  }

  it('normalizes options', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(normalizeOptions({})).toEqual({});
  });

  it('only creates targets for n8n projects with node files', async () => {
    project('libs/ok', [ 'n8n' ], true);
    project('libs/no-tag', [], true);
    project('libs/no-node', [ 'n8n' ], false);
    const result = await createNodesV2[1](
      [ 'libs/ok/tsconfig.lib.json', 'libs/no-tag/tsconfig.lib.json', 'libs/no-node/tsconfig.lib.json', 'libs/missing/tsconfig.lib.json' ],
      undefined,
      { workspaceRoot: root, nxJsonConfiguration: {} } as any,
    );
    expect(result.length).toBe(1);
    const [ file, r ]: any = result[0];
    expect(file).toBe('libs/ok/tsconfig.lib.json');
    expect(r.projects['libs/ok'].targets['fix-dependencies'].options.peerDependencies).toEqual([ 'n8n-workflow' ]);
  });
});
