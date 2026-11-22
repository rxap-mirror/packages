import { ExecutorContext } from '@nx/devkit';
import { rm } from 'fs/promises';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import runExecutor from './executor';

jest.mock('nx/src/executors/run-commands/run-commands.impl', () => ({
  __esModule: true,
  default: jest.fn(async () => ({ success: true })),
}));
jest.mock('fs/promises', () => ({ rm: jest.fn(async () => undefined) }));
jest.mock('@rxap/plugin-utilities', () => ({ GetProjectRoot: jest.fn(() => 'libs/lib') }));

describe('typedoc build executor', () => {

  const runMock = run as unknown as jest.Mock;
  const context = { root: '/ws', projectName: 'lib' } as ExecutorContext;

  beforeEach(() => {
    runMock.mockClear().mockResolvedValue({ success: true });
    (rm as jest.Mock).mockClear();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should only clean the default output path without output formats', async () => {
    expect(await runExecutor({} as any, context)).toEqual({ success: true });
    expect(rm).toHaveBeenCalledWith('libs/lib/docs', { recursive: true, force: true });
    expect(runMock).not.toHaveBeenCalled();
  });

  it('should run typedoc for each requested format', async () => {
    await runExecutor({
      outputPaths: [ 'out' ], json: true, html: true, markdown: true, wiki: true, plugins: [ 'p1', 'p2' ],
      tsconfig: 'tsconfig.json', entryPoints: [ 'a.ts', 'b.ts' ], skipErrorChecking: true, includeVersion: false,
    } as any, context);
    const args = runMock.mock.calls.map(call => call[0].args);
    expect(args).toHaveLength(5);
    expect(args[0]).toEqual([
      '--tsconfig tsconfig.json', '--entryPoints a.ts', '--entryPoints b.ts', '--skipErrorChecking', '--includeVersion false',
      '--json out/documentation.json',
    ]);
    expect(args[1].slice(-1)).toEqual([ '--html out/html' ]);
    expect(args[2].slice(-2)).toEqual([ '--out out/markdown', '--plugin typedoc-plugin-markdown' ]);
    expect(args[3].slice(-3)).toEqual([ '--out out/wiki', '--plugin typedoc-plugin-markdown', '--plugin typedoc-github-wiki-theme' ]);
    expect(args[4].slice(-3)).toEqual([ '--out out', '--plugin p1', '--plugin p2' ]);
  });

  it.each([ 'json', 'html', 'markdown', 'wiki' ])('should stop when the %s run fails', async (format) => {
    runMock.mockResolvedValue({ success: false });
    const result = await runExecutor({ outputPaths: [ 'out' ], [format]: true } as any, context);
    expect(result.success).toBe(false);
  });

  it('should stop when a plugin run fails', async () => {
    runMock.mockResolvedValue({ success: false });
    expect((await runExecutor({ outputPaths: [ 'out' ], plugins: [ 'p' ] } as any, context)).success).toBe(false);
  });

});
