import { ExecutorContext } from '@nx/devkit';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { toArgs } from './to-args';

jest.mock('nx/src/executors/run-commands/run-commands.impl', () => ({
  __esModule: true,
  default: jest.fn(async () => ({ success: true })),
}));
jest.mock('@rxap/plugin-utilities', () => ({ GetProjectRoot: jest.fn(() => 'apps/app') }));

describe('toArgs', () => {
  it('should convert options to args', () => {
    expect(toArgs({ a: 1, b: 'x', c: [ 'p', 'q' ], d: true })).toEqual([ '--a=1', '--b=x', '--c=p', '--c=q', '--d=true' ]);
    expect(toArgs({})).toEqual([]);
  });
});

describe('kraft executors', () => {

  const context = { root: '/ws', projectName: 'app' } as ExecutorContext;
  const runMock = run as unknown as jest.Mock;

  beforeEach(() => {
    runMock.mockClear();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([
    [ 'cloud-deploy', 'kraft cloud deploy', [ '--memory=512' ] ],
    [ 'cloud-img-remove', 'kraft cloud img remove', [ '--memory=512', 'app' ] ],
    [ 'cloud-instance-create', 'kraft cloud instance create', [ '--memory=512', 'app' ] ],
    [ 'cloud-instance-get', 'kraft cloud instance get', [ '--memory=512', 'app' ] ],
    [ 'cloud-instance-logs', 'kraft cloud instance logs', [ '--memory=512', 'app' ] ],
    [ 'cloud-instance-remove', 'kraft cloud instance remove', [ '--memory=512', 'app' ] ],
    [ 'cloud-instance-start', 'kraft cloud instance start', [ '--memory=512', 'app' ] ],
    [ 'cloud-instance-stop', 'kraft cloud instance stop', [ '--memory=512', 'app' ] ],
  ])('%s should run the kraft command', async (name, command, args) => {
    const executor = require(`./${ name }/executor`).default;
    const result = await executor({ memory: '512' }, context);
    expect(result).toEqual({ success: true });
    const config = runMock.mock.calls[0][0];
    expect(config.cwd).toBe('apps/app');
    expect(config.command).toMatch(/^kraft cloud/);
    expect(config.args).toEqual(expect.arrayContaining(args.slice(0, 1)));
    expect(config.command).toBe(command);
  });

  describe('cloud-tunnel', () => {
    const executor = require('./cloud-tunnel/executor').default;

    it('should build the tunnel argument with local port', async () => {
      await executor({ destPort: '8080/tcp', localPort: 9000, urlPath: '/x', 'tunnel-image': 'img' }, context);
      const config = runMock.mock.calls[0][0];
      expect(config.command).toBe('kraft cloud tunnel');
      expect(config.args).toEqual([ '--tunnel-image=img', 'app:8080/tcp:9000' ]);
    });

    it('should work without local port', async () => {
      await executor({ destPort: '8080' }, context);
      expect(runMock.mock.calls[0][0].args).toEqual([ 'app:8080' ]);
    });
  });

});
