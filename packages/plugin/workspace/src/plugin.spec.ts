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

describe('workspace plugin', () => {

  const [ pattern, createNodes ] = createNodesV2;
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'workspace-plugin-'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'ws' }));
    writeFileSync(join(root, 'nx.json'), '{}');
    writeFileSync(join(root, 'project.json'), JSON.stringify({ name: 'ws', root: '.' }));
    mkdirSync(join(root, 'libs/lib'), { recursive: true });
    writeFileSync(join(root, 'libs/lib/project.json'), JSON.stringify({ name: 'lib', root: 'libs/lib' }));
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should normalize options and match project.json', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(pattern).toBe('**/project.json');
  });

  it('should create the ci-info target for the workspace project', async () => {
    const result: any = await createNodes([ 'project.json' ], undefined, { workspaceRoot: root } as any);
    expect(result).toHaveLength(1);
    const targets = result[0][1].projects['.'].targets;
    expect(targets['ci-info'].executor).toBe('@rxap/plugin-workspace:ci-info');
    expect(targets['ci-info'].inputs).toHaveLength(13);
    expect(targets['docker-compose']).toBeUndefined();
  });

  it('should add the docker-compose target if a docker-compose.yml exists', async () => {
    writeFileSync(join(root, 'docker-compose.yml'), 'services: {}');
    const result: any = await createNodes([ 'project.json' ], {}, { workspaceRoot: root } as any);
    expect(result[0][1].projects['.'].targets['docker-compose'].executor).toBe('@rxap/plugin-workspace:docker-compose');
  });

  it('should ignore non root projects', async () => {
    expect(await createNodes([ 'libs/lib/project.json' ], {}, { workspaceRoot: root } as any)).toEqual([]);
  });

});
