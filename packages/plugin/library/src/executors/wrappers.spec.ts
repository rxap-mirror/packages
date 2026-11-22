import { ExecutorContext } from '@nx/devkit';
import bundleJsonSchema from './bundle-json-schema/executor';
import exposeAsSchematic from './expose-as-schematic/executor';
import fixDependencies from './fix-dependencies/executor';
import indexJsonSchema from './index-json-schema/executor';
import { runExecutor as runGenerator } from './run-generator/executor';

jest.mock('./run-generator/executor', () => ({ runExecutor: jest.fn(async () => ({ success: true })) }));

describe('library generator wrapper executors', () => {

  const runMock = runGenerator as jest.Mock;
  let context: ExecutorContext;

  beforeEach(() => {
    runMock.mockClear();
    context = {
      root: '/ws',
      projectName: 'lib',
      projectsConfigurations: { version: 2, projects: { lib: { root: 'libs/lib' }, ws: { root: '/ws' } } },
    } as any;
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    [ 'bundle-json-schema', bundleJsonSchema ],
    [ 'expose-as-schematic', exposeAsSchematic ],
    [ 'index-json-schema', indexJsonSchema ],
  ])('%s should run its generator', async (name, executor) => {
    expect(await (executor as any)({}, context)).toEqual({ success: true });
    expect(runMock).toHaveBeenCalledWith({ generator: `@rxap/plugin-library:${ name }`, options: {} }, context);
  });

  describe('fix-dependencies', () => {

    it('should default to the current project', async () => {
      const options: any = {};
      await fixDependencies(options, context);
      expect(runMock.mock.calls[0][0].options).toEqual({ projects: [ 'lib' ] });
    });

    it('should run for all projects from the workspace root project', async () => {
      context.projectName = 'ws';
      context.root = '/ws';
      (context as any).projectsConfigurations.projects.ws.root = '/ws';
      await fixDependencies({} as any, context);
      expect(runMock.mock.calls[0][0].options).toEqual({});
    });

    it('should keep explicit projects', async () => {
      await fixDependencies({ projects: [ 'a' ] } as any, context);
      expect(runMock.mock.calls[0][0].options).toEqual({ projects: [ 'a' ] });
    });

    it('should fail without project name', async () => {
      await expect(fixDependencies({} as any, { ...context, projectName: undefined } as any)).rejects.toThrow('No projects are defined');
    });

  });

});
