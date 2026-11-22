import { ExecutorContext } from '@nx/devkit';
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

describe('config executor', () => {

  let root: string;
  let context: ExecutorContext;
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('RXAP_CONFIG')) {
        delete process.env[key];
      }
    }
    root = mkdtempSync(join(tmpdir(), 'config-'));
    mkdirSync(join(root, 'dist/app'), { recursive: true });
    context = {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'app',
      projectsConfigurations: {
        version: 2,
        projects: {
          app: {
            root: 'apps/app',
            targets: { build: { executor: 'x', options: { outputPath: join(root, 'dist/app') } } },
          },
        },
      },
    } as any;
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.env = savedEnv;
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('should succeed without config variables', async () => {
    expect(await runExecutor({}, context)).toEqual({ success: true });
  });

  it('should write the default config file', async () => {
    process.env['RXAP_CONFIG'] = '{"a":1}';
    const result = await runExecutor({}, context);
    expect(result.success).toBe(true);
    expect(readFileSync(join(root, 'dist/app/config.json'), 'utf-8')).toBe('{"a":1}');
  });

  it('should write a named config file and read from a file path', async () => {
    const file = join(root, 'source.json');
    writeFileSync(file, '{"b":2}');
    process.env['RXAP_CONFIG_FOO_BAR'] = file;
    const result = await runExecutor({}, context);
    expect(result.success).toBe(true);
    expect(readFileSync(join(root, 'dist/app/config.foo.bar.json'), 'utf-8')).toBe('{"b":2}');
  });

  it('should fail on invalid json', async () => {
    process.env['RXAP_CONFIG'] = 'not json';
    const result: any = await runExecutor({}, context);
    expect(result.success).toBe(false);
    expect(existsSync(join(root, 'dist/app/config.json'))).toBe(false);
  });

  it('should fail on an empty variable', async () => {
    process.env['RXAP_CONFIG_EMPTY'] = '';
    const result: any = await runExecutor({}, context);
    expect(result.success).toBe(false);
  });

});
