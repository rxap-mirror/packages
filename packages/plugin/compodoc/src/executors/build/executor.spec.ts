import { ExecutorContext } from '@nx/devkit';
import { EventEmitter } from 'events';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import runExecutor from './executor';

const spawnMock = jest.fn();
jest.mock('child_process', () => ({ ...jest.requireActual('child_process'), spawn: (...args: any[]) => spawnMock(...args) }));

function fakeChild(code: number) {
  const child: any = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  setTimeout(() => {
    child.stdout.emit('data', Buffer.from('out'));
    child.stderr.emit('data', Buffer.from('err'));
    child.emit('close', code);
  }, 0);
  return child;
}

describe('compodoc build executor', () => {

  let root: string;
  const originalCwd = process.cwd();
  let context: ExecutorContext;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'compodoc-'));
    mkdirSync(join(root, 'libs/lib'), { recursive: true });
    writeFileSync(join(root, 'libs/lib/README.md'), '# lib');
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'ws' }));
    context = {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'lib',
      projectsConfigurations: {
        version: 2,
        projects: {
          lib: { root: 'libs/lib' },
          ws: { root: '' },
        },
      },
    } as any;
    process.chdir(root);
    spawnMock.mockReset().mockImplementation(() => fakeChild(0));
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should require a tsconfig', async () => {
    await expect(runExecutor({} as any, context)).rejects.toThrow('tsConfig option is required');
  });

  it('should start the compodoc cli resolved from the workspace root with node', async () => {
    const packageRoot = join(root, 'node_modules/@compodoc/compodoc');
    mkdirSync(join(packageRoot, 'bin'), { recursive: true });
    writeFileSync(join(packageRoot, 'package.json'), JSON.stringify({ name: '@compodoc/compodoc', bin: { compodoc: './bin/index-cli.js' } }));
    writeFileSync(join(packageRoot, 'bin/index-cli.js'), '');
    writeFileSync(join(root, 'libs/lib/tsconfig.compodoc.json'), '{}');
    await runExecutor({ exportFormat: 'json' } as any, context);
    const [ cmd ] = spawnMock.mock.calls[0];
    expect(cmd).toBe('node ../../node_modules/@compodoc/compodoc/bin/index-cli.js');
  });

  it('should spawn compodoc with default options', async () => {
    writeFileSync(join(root, 'libs/lib/tsconfig.compodoc.json'), '{}');
    const result = await runExecutor({ exportFormat: 'json', debug: true } as any, context);
    expect(result).toEqual({ success: true });
    const [ cmd, args, options ] = spawnMock.mock.calls[0];
    expect(cmd).toMatch(/node_modules\/\.bin\/compodoc$/);
    expect(args).toEqual(expect.arrayContaining([
      '--tsconfig="tsconfig.compodoc.json"', '--output="compodoc"', '--exportFormat="json"', '--minimal', '--name="lib"', '--silent',
    ]));
    expect(options.cwd).toBe(join(root, 'libs/lib'));
  });

  it('should fail if compodoc fails', async () => {
    spawnMock.mockImplementation(() => fakeChild(1));
    const result = await runExecutor({ tsConfig: 'libs/lib/tsconfig.json', outputPath: 'libs/lib/out' } as any, context);
    expect(result).toEqual({ success: false });
  });

  it('should copy the output to additional output paths', async () => {
    const out1 = join(root, 'out1');
    const out2 = join(root, 'out2');
    mkdirSync(out1);
    writeFileSync(join(out1, 'index.html'), 'x');
    const result = await runExecutor({
      tsConfig: 'libs/lib/tsconfig.json', outputPath: [ out1, out2 ], watch: false, serve: false,
      coverageTest: true, disableCoverage: true, port: 8080,
    } as any, context);
    expect(result.success).toBe(true);
    expect(existsSync(join(out2, 'index.html'))).toBe(true);
    const args: string[] = spawnMock.mock.calls[0][1];
    expect(args).toContain('--coverageTest');
    expect(args.some(arg => arg.startsWith('--disableCoverage'))).toBe(false);
  });

  it('should create an initial json when watching', async () => {
    const out = join(root, 'watch-out');
    await runExecutor({ tsConfig: 'libs/lib/tsconfig.json', outputPath: 'libs/lib/watch-out', exportFormat: 'json', watch: true } as any, context);
    expect(existsSync(join(out, 'documentation.json'))).toBe(true);
    expect(JSON.parse(readFileSync(join(out, 'documentation.json'), 'utf-8')).components).toEqual([]);
    const args: string[] = spawnMock.mock.calls[0][1];
    expect(args).toContain('--watch');
    expect(args).toContain('--serve');
  });

  it('should create workspace includes and use nodemon when watching the workspace', async () => {
    context.projectName = 'ws';
    const result = await runExecutor({ tsConfig: 'tsconfig.base.json', outputPath: join(root, 'ws-out'), watch: true } as any, context);
    expect(result.success).toBe(true);
    const [ cmd, args ] = spawnMock.mock.calls[0];
    expect(cmd).toContain('nodemon');
    expect(args[0]).toBe('--ignore dist');
  });

});
