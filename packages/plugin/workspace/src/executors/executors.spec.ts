import { ExecutorContext } from '@nx/devkit';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import dockerCompose from './docker-compose/executor';
import { runExecutor } from './run-generator/executor';

jest.mock('nx/src/executors/run-commands/run-commands.impl', () => ({
  __esModule: true,
  default: jest.fn(async () => ({ success: true })),
}));
jest.mock('@rxap/plugin-utilities', () => ({
  GetProjectRoot: jest.fn(() => 'libs/lib'),
  GetProjectSourceRoot: jest.fn(() => 'libs/lib/src'),
}));
const isRxapRepository = jest.fn(() => false);
jest.mock('@rxap/workspace-utilities', () => ({ IsRxapRepository: (...args: any[]) => (isRxapRepository as any)(...args) }));

describe('workspace executors', () => {

  const runMock = run as unknown as jest.Mock;
  let context: ExecutorContext;

  beforeEach(() => {
    runMock.mockClear().mockResolvedValue({ success: true });
    isRxapRepository.mockReturnValue(false);
    context = { root: '/ws', cwd: '/ws', projectName: 'lib', targetName: 'gen', configurationName: 'prod' } as any;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  describe('run-generator', () => {

    it('should build the nx generate command', async () => {
      const result = await runExecutor({
        generator: '@a/b:c',
        options: { a: 'x', list: [ 'p', { q: 1 } ], obj: { k: 'v' } },
        dryRun: true,
        verbose: true,
      }, context);
      expect(result).toEqual({ success: true });
      const config = runMock.mock.calls[0][0];
      expect(config.cwd).toBe('/ws');
      expect(config.command).toBe(
        `nx g @a/b:c --a='x' --list='p' --list='{"q":1}' --obj='{"k":"v"}' --project='lib' --dry-run --verbose`);
    });

    it('should omit the project argument and interpolate strings', async () => {
      await runExecutor({
        generator: '@a/b:c', withoutProjectArgument: true,
        options: { path: '{projectRoot}/{targetName}/{configurationName}/{workspaceRoot}/{projectSourceRoot}/{projectName}/{cwd}' },
      }, context);
      expect(runMock.mock.calls[0][0].command).toBe(`nx g @a/b:c --path='libs/lib/gen/prod//ws/libs/lib/src/lib//ws'`);
    });

    it('should fail on unknown interpolation parameters', async () => {
      await expect(runExecutor({ generator: 'g', options: { a: '{unknown}' } }, context)).rejects.toThrow('Could not find property unknown');
    });

    it('should flatten option- prefixed options', async () => {
      await runExecutor({ generator: 'g', 'option-foo': 1, optionBar: 2 } as any, context);
      const command = runMock.mock.calls[0][0].command;
      expect(command).toContain(`--foo='1'`);
      expect(command).toContain(`--bar='2'`);
    });

    it('should run the schematic script with the workspace package manager in the rxap repository', async () => {
      isRxapRepository.mockReturnValue(true);
      await runExecutor({ generator: '@rxap/schematic-angular:init' }, context);
      expect(runMock.mock.calls[0][0].command).toMatch(/^yarn schematic @rxap\/schematic-angular:init/);
    });

    it('should fail without project or target name', async () => {
      expect(await runExecutor({ generator: 'g' }, { ...context, projectName: undefined } as any)).toEqual({ success: false });
      expect(await runExecutor({ generator: 'g' }, { ...context, targetName: undefined } as any)).toEqual({ success: false });
    });

    it('should warn without configuration name', async () => {
      await runExecutor({ generator: 'g' }, { ...context, configurationName: undefined } as any);
      expect(console.warn).toHaveBeenCalled();
    });

  });

  describe('docker-compose', () => {
    it('should run the docker-compose generator without empty options', async () => {
      await dockerCompose({ tags: [ 'a' ], rootDomain: undefined, middlewares: [] } as any, context);
      const command = runMock.mock.calls[0][0].command;
      expect(command).toContain('nx g @rxap/plugin-workspace:docker-compose');
      expect(command).toContain(`--tags='a'`);
      expect(command).not.toContain('--project');
      expect(command).not.toContain('rootDomain');
    });
  });

});
