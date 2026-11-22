import {
  createNodesV2,
  normalizeOptions,
} from './plugin';

const findProjectByPath = jest.fn();
jest.mock('@rxap/workspace-utilities', () => ({
  FsTree: class {},
  FindProjectByPath: (...args: any[]) => findProjectByPath(...args),
}));

describe('compodoc plugin', () => {

  const [ pattern, createNodes ] = createNodesV2;
  const context: any = { workspaceRoot: '/ws' };

  beforeEach(() => findProjectByPath.mockReset());

  it('should normalize options and match tsconfig.compodoc.json', () => {
    expect(normalizeOptions(undefined)).toEqual({});
    expect(pattern).toBe('**/tsconfig.compodoc.json');
  });

  it('should create the compodoc target', async () => {
    findProjectByPath.mockReturnValue({});
    const result: any = await createNodes([ 'libs/lib/tsconfig.compodoc.json' ], undefined, context);
    const target = result[0][1].projects['libs/lib'].targets['compodoc'];
    expect(target.executor).toBe('@rxap/plugin-compodoc:build');
    expect(target.defaultConfiguration).toBe('html');
    expect(target.configurations.json.exportFormat).toBe('json');
  });

  it('should skip files outside of projects', async () => {
    findProjectByPath.mockReturnValue(null);
    expect(await createNodes([ 'x/tsconfig.compodoc.json' ], {}, context)).toEqual([]);
  });

});
