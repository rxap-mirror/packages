import {
  createNodesV2,
  normalizeOptions,
} from './plugin';

const findProjectByPath = jest.fn();
jest.mock('@rxap/workspace-utilities', () => ({
  FsTree: class {},
  FindProjectByPath: (...args: any[]) => findProjectByPath(...args),
}));

describe('localazy plugin', () => {

  const [ pattern, createNodes ] = createNodesV2;
  const context: any = { workspaceRoot: '/ws' };

  beforeEach(() => findProjectByPath.mockReset());

  it('should normalize options and match localazy.json', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(pattern).toBe('**/localazy.json');
  });

  it('should create download and upload targets', async () => {
    findProjectByPath.mockReturnValue({});
    const result: any = await createNodes([ 'apps/app/localazy.json' ], undefined, context);
    const targets = result[0][1].projects['apps/app'].targets;
    expect(targets['localazy-download'].options.workingDirectory).toBe('apps/app');
    expect(targets['localazy-upload'].dependsOn).toEqual([ 'extract-i18n' ]);
  });

  it('should skip files outside of projects', async () => {
    findProjectByPath.mockReturnValue(null);
    expect(await createNodes([ 'x/localazy.json' ], {}, context)).toEqual([]);
  });

});
