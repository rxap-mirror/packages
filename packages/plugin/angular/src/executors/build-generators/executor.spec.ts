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
import executor from './executor';

describe('plugin-angular build-generators executor', () => {
  let root: string;
  const projectRoot = 'packages/lib';

  function write(path: string, content: string) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), content);
  }

  function context(): any {
    return {
      root,
      projectName: 'lib',
      projectsConfigurations: { version: 2, projects: { lib: { root: projectRoot } } },
    };
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'build-generators-'));
    write(`${ projectRoot }/tsconfig.generators.json`, JSON.stringify({
      compilerOptions: { module: 'commonjs', target: 'es2021', types: [], strict: true, skipLibCheck: true },
      include: [ 'src/generators/**/*.ts' ],
      exclude: [ 'src/generators/**/*.spec.ts' ],
    }));
    write(`${ projectRoot }/generators.json`, '{"generators":{}}');
    write(`${ projectRoot }/src/generators/init/generator.ts`, 'export default async function () { return 42; }\n');
    write(`${ projectRoot }/src/generators/init/generator.spec.ts`, 'throw new Error("spec must not be compiled");\n');
    write(`${ projectRoot }/src/generators/init/schema.json`, '{}');
    write(`${ projectRoot }/src/generators/init/schema.d.ts`, 'export interface S {}\n');
    write(`${ projectRoot }/src/generators/init/files/a.ts.template`, 'template');
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('compiles the generators to commonjs and stages generators.json and the generator assets', async () => {
    const result = await executor({}, context());
    expect(result).toEqual({ success: true });
    const out = join(root, projectRoot, 'dist/generators');
    expect(readFileSync(join(out, 'src/generators/init/generator.js'), 'utf-8')).toContain('exports.default');
    expect(existsSync(join(out, 'src/generators/init/generator.spec.js'))).toBe(false);
    expect(existsSync(join(out, 'generators.json'))).toBe(true);
    expect(existsSync(join(out, 'src/generators/init/schema.json'))).toBe(true);
    expect(existsSync(join(out, 'src/generators/init/files/a.ts.template'))).toBe(true);
    expect(existsSync(join(out, 'src/generators/init/generator.ts'))).toBe(false);
    expect(existsSync(join(out, 'src/generators/init/schema.d.ts'))).toBe(false);
    expect(JSON.parse(readFileSync(join(out, 'src/generators/package.json'), 'utf-8'))).toEqual({ type: 'commonjs' });
  }, 60_000);

  it('fails when the tsconfig is missing', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    rmSync(join(root, projectRoot, 'tsconfig.generators.json'));
    expect(await executor({}, context())).toEqual({ success: false });
  });

  it('fails when the generators do not compile', async () => {
    write(`${ projectRoot }/src/generators/init/generator.ts`, 'const a: number = "x";\n');
    expect(await executor({}, context())).toEqual({ success: false });
  }, 60_000);
});
