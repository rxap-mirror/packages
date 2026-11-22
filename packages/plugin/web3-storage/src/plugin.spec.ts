import {
  createNodesV2,
  normalizeOptions,
} from './plugin';

const findProjectByPath = jest.fn();

jest.mock('@rxap/workspace-utilities', () => ({
  FsTree: class {},
  FindProjectByPath: (...args: any[]) => findProjectByPath(...args),
}));

describe('web3-storage plugin', () => {

  const [ pattern, createNodes ] = createNodesV2;
  const context: any = { workspaceRoot: '/ws' };

  beforeEach(() => findProjectByPath.mockReset());

  it('should normalize options', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(normalizeOptions({})).toEqual({});
  });

  it('should match tsconfig.app.json files', () => {
    expect(pattern).toBe('**/tsconfig.app.json');
  });

  it('should create a deploy target for application projects', async () => {
    findProjectByPath.mockReturnValue({ tags: [] });
    const result = await createNodes([ 'apps/app/tsconfig.app.json' ], {}, context);
    expect(result).toHaveLength(1);
    const [ file, { projects } ] = result[0] as any;
    expect(file).toBe('apps/app/tsconfig.app.json');
    expect(projects['apps/app'].targets.deploy.executor).toBe('@rxap/plugin-web3-storage:deploy');
  });

  it('should skip files outside of a project', async () => {
    findProjectByPath.mockReturnValue(null);
    expect(await createNodes([ 'x/tsconfig.app.json' ], undefined, context)).toEqual([]);
  });

  it('should skip projects tagged web3-storage', async () => {
    findProjectByPath.mockReturnValue({ tags: [ 'web3-storage' ] });
    expect(await createNodes([ 'x/tsconfig.app.json' ], {}, context)).toEqual([]);
  });

});
