import {
  createNodesV2,
  normalizeOptions,
} from './plugin';

const findProjectByPath = jest.fn();
jest.mock('@rxap/workspace-utilities', () => ({
  FsTree: class {},
  FindProjectByPath: (...args: any[]) => findProjectByPath(...args),
}));

describe('kraft plugin', () => {

  const [ pattern, createNodes ] = createNodesV2;
  const context: any = { workspaceRoot: '/ws' };

  beforeEach(() => findProjectByPath.mockReset());

  it('should normalize options', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(normalizeOptions({})).toEqual({});
  });

  it('should match Kraftfiles', () => {
    expect(pattern).toBe('**/Kraftfile');
  });

  it('should create all kraft targets for projects with a Kraftfile', async () => {
    findProjectByPath.mockReturnValue({});
    const result: any = await createNodes([ 'apps/app/Kraftfile' ], undefined, context);
    expect(result).toHaveLength(1);
    const targets = result[0][1].projects['apps/app'].targets;
    expect(Object.keys(targets)).toHaveLength(9);
    expect(targets['kraft-cloud-tunnel'].executor).toBe('@rxap/plugin-kraft:cloud-tunnel');
    expect(targets['kraft-cloud-deploy'].configurations.development['scale-to-zero']).toBe('off');
  });

  it('should skip Kraftfiles outside of projects', async () => {
    findProjectByPath.mockReturnValue(null);
    expect(await createNodes([ 'x/Kraftfile' ], {}, context)).toEqual([]);
  });

});
