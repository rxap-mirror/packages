import { detectPackageManager, ExecutorContext, getPackageManagerCommand, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as childProcess from 'child_process';
import { EventEmitter } from 'events';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { GetAllPackageDependenciesForProject, GetAllPackageDependenciesForProjectWihRetry } from './get-all-package-dependencies-for-project';
import {
  getDirectPackageDependenciesForProject,
  getDirectPackageDependenciesForProjectWihRetry,
} from './get-direct-package-dependencies-for-project';
import { GetWorkspaceName } from './get-workspace-name';
import {
  DEFAULT_GOLDEN_MASTER_EXCLUDES,
  ListGeneratedFiles,
  SnapshotGeneratedTree,
} from './golden-master';
import {
  GuessOutputPath,
  GuessOutputPathFromContext,
  GuessOutputPathFromTargetString,
} from './guess-output-path';
import {
  GetProjectConfiguration,
  GetProjectRoot,
  GetProjectSourceRoot,
  IsWorkspaceProject,
} from './project';
import {
  readPackageJsonForProject,
  readPackageJsonForProjectWithRetry,
  readRootPackageJson,
  writePackageJsonFormProject,
} from './project-package-json';
import {
  HasProjectWithPackageName,
  LoadProjectToPackageMapping,
  LoadProjectToPackageMappingWithRetry,
  PackageNameToProjectName,
  ProjectNameToPackageName,
} from './project-package-name-mapping';
import {
  hasFileInProjectRoot,
  readFileFromProjectRoot,
  writeFileToProjectRoot,
} from './project-root-files';
import {
  ReadFileFromProjectSourceRoot,
  WriteFileToProjectSourceRoot,
} from './project-source-root-files';
import {
  GetProjectTarget,
  GetProjectTargetOptions,
  HasProjectTarget,
} from './project-target';
import { CollectTypeScriptSyntaxDiagnostics } from './typescript-syntax-check';
import { PackageManagerExec, YarnRun } from './yarn-run';

jest.mock('child_process', () => ({ ...jest.requireActual('child_process'), spawn: jest.fn() }));

describe('plugin-utilities', () => {
  let root: string;
  let context: ExecutorContext;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'plugin-utilities-'));
    mkdirSync(join(root, 'libs/a/src'), { recursive: true });
    mkdirSync(join(root, 'libs/b'), { recursive: true });
    mkdirSync(join(root, 'libs/c'), { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@scope/source' }));
    writeFileSync(join(root, 'libs/a/package.json'), JSON.stringify({ name: '@scope/a', version: '1.0.0' }));
    writeFileSync(join(root, 'libs/b/package.json'), JSON.stringify({ name: '@scope/b', version: '2.0.0' }));
    // c has no version -> dropped
    writeFileSync(join(root, 'libs/c/package.json'), JSON.stringify({ name: '@scope/c' }));
    context = {
      root,
      cwd: root,
      isVerbose: false,
      projectName: 'a',
      configurationName: 'prod',
      projectsConfigurations: {
        version: 2,
        projects: {
          a: {
            root: 'libs/a',
            sourceRoot: 'libs/a/src',
            targets: {
              build: {
                executor: 'x',
                options: { outputPath: 'dist/{projectRoot}', v: 1 },
                configurations: { prod: { v: 2 } },
              },
            },
          },
          b: { root: 'libs/b' },
          c: { root: 'libs/c' },
          d: { root: 'libs/d' },
          ws: { root: '' },
        },
      },
      projectGraph: {
        nodes: {
          a: { type: 'lib', name: 'a', data: { root: join(root, 'libs/a') } },
          b: { type: 'lib', name: 'b', data: { root: join(root, 'libs/b') } },
          c: { type: 'lib', name: 'c', data: { root: join(root, 'libs/c') } },
          d: { type: 'lib', name: 'd', data: { root: join(root, 'libs/d') } },
          app: { type: 'app', name: 'app', data: { root: join(root, 'libs/b') } },
        },
        dependencies: {
          a: [
            { type: 'static', source: 'a', target: 'b' },
            { type: 'static', source: 'a', target: 'c' },
            { type: 'static', source: 'a', target: 'd' },
            { type: 'static', source: 'a', target: 'npm:rxjs' },
          ],
          b: [],
        },
      },
    } as any;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe('project', () => {
    it('resolves configuration, root and source root', () => {
      expect(GetProjectConfiguration(context).root).toBe('libs/a');
      expect(GetProjectRoot(context, 'b')).toBe('libs/b');
      expect(GetProjectSourceRoot(context)).toBe('libs/a/src');
      expect(GetProjectSourceRoot(context, 'b')).toBe(join('libs/b', 'src'));
    });
    it('throws on missing information', () => {
      expect(() => GetProjectConfiguration({ ...context, projectsConfigurations: undefined } as any)).toThrow('projectsConfigurations');
      expect(() => GetProjectConfiguration({ ...context, projectName: undefined } as any)).toThrow('projectName');
      expect(() => GetProjectConfiguration(context, 'nope')).toThrow(`'nope' not found`);
    });
    it('IsWorkspaceProject', () => {
      expect(IsWorkspaceProject(context, 'ws')).toBe(true);
      expect(IsWorkspaceProject(context, 'a')).toBe(false);
    });
  });

  describe('project-target', () => {
    it('has / gets target', () => {
      expect(HasProjectTarget(context, 'a', 'build')).toBe(true);
      expect(HasProjectTarget(context, 'a', 'x')).toBe(false);
      expect(HasProjectTarget(context, 'b', 'build')).toBe(false);
      expect(GetProjectTarget(context, 'a', 'build').executor).toBe('x');
      expect(() => GetProjectTarget(context, 'a', 'x')).toThrow('not found');
      expect(() => GetProjectTarget(context, 'b', 'build')).toThrow('not found');
    });
    it('merges configuration options', () => {
      expect(GetProjectTargetOptions(context, 'a', 'build')).toMatchObject({ v: 2 });
      expect(GetProjectTargetOptions(context, 'a', 'build', undefined)).toMatchObject({ v: 2 });
    });
  });

  describe('project files', () => {
    it('reads and writes project root files', () => {
      expect(hasFileInProjectRoot(context, 'x.txt')).toBe(false);
      expect(readFileFromProjectRoot(context, 'x.txt')).toBe('');
      expect(readFileFromProjectRoot(context, 'x.txt', 'dflt')).toBe('dflt');
      expect(() => readFileFromProjectRoot(context, 'x.txt', true)).toThrow('not exists');
      writeFileToProjectRoot(context, 'x.txt', 'hello');
      expect(hasFileInProjectRoot(context, 'x.txt')).toBe(true);
      expect(readFileFromProjectRoot(context, 'x.txt', true)).toBe('hello');
    });
    it('reads and writes project source root files', () => {
      expect(ReadFileFromProjectSourceRoot(context, 'y.ts')).toBe('');
      expect(ReadFileFromProjectSourceRoot(context, 'y.ts', 'dflt')).toBe('dflt');
      expect(() => ReadFileFromProjectSourceRoot(context, 'y.ts', true)).toThrow('not exists');
      WriteFileToProjectSourceRoot(context, 'y.ts', 'code');
      expect(readFileSync(join(root, 'libs/a/src/y.ts'), 'utf-8')).toBe('code');
      expect(ReadFileFromProjectSourceRoot(context, 'y.ts', true)).toBe('code');
    });
  });

  describe('package json', () => {
    it('reads project and root package.json', async () => {
      expect(readPackageJsonForProject(context).name).toBe('@scope/a');
      expect((await readPackageJsonForProjectWithRetry(context, 'b', 1, 1)).name).toBe('@scope/b');
      expect((await readRootPackageJson(context, 1, 1)).name).toBe('@scope/source');
    });
    it('writes cleaned package.json', () => {
      writePackageJsonFormProject(context, { name: '@scope/a', version: '3.0.0' } as any);
      expect(JSON.parse(readFileSync(join(root, 'libs/a/package.json'), 'utf-8')).version).toBe('3.0.0');
    });
    it('GetWorkspaceName strips scope and source', () => {
      expect(GetWorkspaceName(context)).toBe('scope');
      writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@scope/other' }));
      expect(GetWorkspaceName(context)).toBe('other');
      writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'plain' }));
      expect(GetWorkspaceName(context)).toBe('plain');
    });
  });

  describe('package mapping and dependencies', () => {
    it('throws before the cache is loaded or without a graph', () => {
      expect(() => LoadProjectToPackageMapping({ ...context, projectGraph: undefined } as any)).toThrow('projectGraph');
      return expect(LoadProjectToPackageMappingWithRetry({ ...context, projectGraph: undefined } as any)).rejects.toThrow('projectGraph');
    });

    it('maps libs with a package.json both ways', () => {
      LoadProjectToPackageMapping(context);
      expect(PackageNameToProjectName('@scope/a')).toBe('a');
      expect(ProjectNameToPackageName('b')).toBe('@scope/b');
      expect(HasProjectWithPackageName('@scope/c')).toBe(true);
      expect(HasProjectWithPackageName('@scope/d')).toBe(false);
      expect(() => PackageNameToProjectName('nope')).toThrow('Could not find project');
      expect(() => ProjectNameToPackageName('nope')).toThrow('Could not find package');
    });

    it('maps with retry', async () => {
      await LoadProjectToPackageMappingWithRetry(context, 1, 1);
      expect(PackageNameToProjectName('@scope/b')).toBe('b');
    });

    it('collects direct dependencies with name and version only', () => {
      expect(getDirectPackageDependenciesForProject(context)).toEqual({ '@scope/b': '2.0.0' });
    });
    it('collects direct dependencies with retry', async () => {
      expect(await getDirectPackageDependenciesForProjectWihRetry(context, 'a', 1, 1)).toEqual({ '@scope/b': '2.0.0' });
      expect(console.warn).toHaveBeenCalled();
    });
    it('validates direct dependency input', async () => {
      const noGraph = { ...context, projectGraph: undefined } as any;
      expect(() => getDirectPackageDependenciesForProject(noGraph)).toThrow('projectGraph');
      expect(() => getDirectPackageDependenciesForProject({ ...context, projectName: undefined } as any)).toThrow('projectName');
      expect(() => getDirectPackageDependenciesForProject(context, 'zzz')).toThrow('does not exist in the projectGraph');
      await expect(getDirectPackageDependenciesForProjectWihRetry(noGraph)).rejects.toThrow('projectGraph');
      await expect(getDirectPackageDependenciesForProjectWihRetry({ ...context, projectName: undefined } as any)).rejects.toThrow('projectName');
      await expect(getDirectPackageDependenciesForProjectWihRetry(context, 'zzz')).rejects.toThrow('does not exist');
    });

    it('collects transitive dependencies', async () => {
      LoadProjectToPackageMapping(context);
      expect(GetAllPackageDependenciesForProject(context)).toEqual({ '@scope/b': '2.0.0' });
      expect(await GetAllPackageDependenciesForProjectWihRetry(context, 'a', {}, 1, 1)).toEqual({ '@scope/b': '2.0.0' });
      expect(() => GetAllPackageDependenciesForProject({ ...context, projectGraph: undefined } as any)).toThrow('projectGraph');
      expect(() => GetAllPackageDependenciesForProject({ ...context, projectName: undefined } as any)).toThrow('projectName');
      await expect(GetAllPackageDependenciesForProjectWihRetry({ ...context, projectGraph: undefined } as any)).rejects.toThrow('projectGraph');
      await expect(GetAllPackageDependenciesForProjectWihRetry({ ...context, projectName: undefined } as any)).rejects.toThrow('projectName');
    });
  });

  describe('GuessOutputPath', () => {
    const target = (t: any) => t;
    it('prefers outputPath option and substitutes placeholders', () => {
      expect(GuessOutputPath('p', 'libs/p', target({ options: { outputPath: 'dist/{projectName}/{projectRoot}' } }))).toBe('dist/p/libs/p');
      expect(GuessOutputPath('p', 'libs/p', target({ options: { outputPath: '{workspaceRoot}/dist/x' } }))).toBe('dist/x');
    });
    it('uses configuration specific outputPath', () => {
      expect(GuessOutputPath('p', 'r', target({ options: { outputPath: 'a' }, configurations: { prod: { outputPath: 'b' } } }), 'prod')).toBe('b');
    });
    it('falls back to outputs', () => {
      expect(GuessOutputPath('p', 'r', target({ outputs: [ 'dist/x' ] }))).toBe('dist/x');
      expect(GuessOutputPath('p', 'r', target({ outputs: [ 'dist/x/file.js' ] }))).toBe('dist/x');
    });
    it('falls back to dist/projectRoot', () => {
      expect(GuessOutputPath('p', 'libs/p', target({}))).toBe(join('dist', 'libs/p'));
    });
    it('supports angular object output path and rejects invalid ones', () => {
      expect(GuessOutputPath('p', 'r', target({ options: { outputPath: { base: 'dist/ng' } } }))).toBe('dist/ng');
      expect(() => GuessOutputPath('p', 'r', target({ options: { outputPath: { x: 1 } } }))).toThrow('not a string');
      expect(() => GuessOutputPath('p', 'r', target({ options: { outputPath: 5 } }))).toThrow('not a string');
    });
    it('from context', () => {
      expect(GuessOutputPathFromContext(context)).toBe(join('dist', 'libs/a'));
      expect(() => GuessOutputPathFromContext({ ...context, projectName: undefined } as any)).toThrow('projectName');
      expect(GuessOutputPathFromContext(context, 'b')).toBe(join('libs/b', 'src'));
      expect(console.warn).toHaveBeenCalled();
    });
    it('from target string', () => {
      expect(GuessOutputPathFromTargetString(context)).toBe(join('dist', 'libs/a'));
      expect(GuessOutputPathFromTargetString(context, 'a:build:prod')).toBe(join('dist', 'libs/a'));
      expect(() => GuessOutputPathFromTargetString(context, ':build')).toThrow('project name');
      expect(() => GuessOutputPathFromTargetString(context, 'a')).toThrow('target name');
    });
  });

  describe('golden master', () => {
    let tree: Tree;
    beforeEach(() => {
      tree = createTreeWithEmptyWorkspace();
    });
    it('lists generated files sorted and excluding noise', () => {
      tree.write('b.ts', '1');
      tree.write('a.ts', '2');
      tree.write('node_modules/x/index.js', '3');
      tree.write('yarn.lock', '4');
      tree.write('gen/skip.ts', '5');
      const files = ListGeneratedFiles(tree, { exclude: [ 'gen/' ] });
      expect(files).toContain('a.ts');
      expect(files.indexOf('a.ts')).toBeLessThan(files.indexOf('b.ts'));
      expect(files).not.toContain('yarn.lock');
      expect(files).not.toContain('gen/skip.ts');
      expect(files.some(f => f.includes('node_modules'))).toBe(false);
      expect(DEFAULT_GOLDEN_MASTER_EXCLUDES.length).toBeGreaterThan(0);
    });
    it('snapshots contents and optionally deletions', () => {
      tree.write('keep.ts', 'content');
      tree.write('gone.ts', 'x');
      const base = createTreeWithEmptyWorkspace();
      expect(SnapshotGeneratedTree(tree)['keep.ts']).toBe('content');
      expect(base).toBeDefined();
      const committed = tree;
      (committed as any).listChanges = () => [
        { path: 'keep.ts', type: 'CREATE', content: Buffer.from('content') },
        { path: 'gone.ts', type: 'DELETE', content: null },
        { path: 'empty.ts', type: 'UPDATE', content: null },
      ];
      expect(SnapshotGeneratedTree(committed)).toEqual({ 'keep.ts': 'content', 'empty.ts': '' });
      expect(SnapshotGeneratedTree(committed, { includeDeletions: true })['gone.ts']).toBe('<<DELETED>>');
      expect(ListGeneratedFiles(committed)).toEqual([ 'empty.ts', 'keep.ts' ]);
      expect(ListGeneratedFiles(committed, { includeDeletions: true })).toContain('gone.ts');
    });
  });

  describe('CollectTypeScriptSyntaxDiagnostics', () => {
    it('returns nothing for valid code and ignores non-ts / d.ts', () => {
      expect(CollectTypeScriptSyntaxDiagnostics({
        'a.ts': 'export const a: number = 1;',
        'b.js': 'this is not valid',
        'c.d.ts': 'declare const x',
      })).toEqual([]);
    });
    it('reports positions of syntax errors sorted by path', () => {
      const result = CollectTypeScriptSyntaxDiagnostics({
        'z.ts': 'const = ;',
        'a.ts': 'const a = 1;\nconst b = ;',
      });
      expect(result.map(r => r.path)).toEqual(expect.arrayContaining([ 'a.ts', 'z.ts' ]));
      expect(result[0].path).toBe('a.ts');
      expect(result[0].line).toBe(2);
      expect(result[0].character).toBeGreaterThan(0);
      expect(result[0].message).toBeTruthy();
    });
  });

  describe('YarnRun', () => {
    function fakeSpawn(behaviour: (s: any) => void) {
      (childProcess.spawn as jest.Mock).mockImplementation((() => {
        const s: any = new EventEmitter();
        s.stdout = new EventEmitter();
        setImmediate(() => behaviour(s));
        return s;
      }) as any);
    }
    it('resolves with exit code 0 and logs stdout', async () => {
      fakeSpawn(s => {
        s.stdout.emit('data', Buffer.from('out'));
        s.emit('close', 0);
      });
      await expect(YarnRun([ 'install' ])).resolves.toBe(0);
      expect(console.log).toHaveBeenCalledWith('$ yarn install');
      expect(console.log).toHaveBeenCalledWith('out');
      expect(childProcess.spawn).toHaveBeenCalledWith('yarn', [ 'install' ], expect.objectContaining({ shell: true }));
    });
    it('rejects on non-zero exit', async () => {
      fakeSpawn(s => s.emit('close', 2));
      await expect(YarnRun([ 'x' ])).rejects.toThrow('exited with code 2');
    });
    it('rejects on spawn errors, but only logs ENOENT', async () => {
      fakeSpawn(s => s.emit('error', new Error('boom')));
      await expect(YarnRun([ 'x' ])).rejects.toThrow('boom');
      fakeSpawn(s => {
        s.emit('error', Object.assign(new Error('nf'), { code: 'ENOENT' }));
        s.emit('close', 0);
      });
      await expect(YarnRun([ 'x' ])).resolves.toBe(0);
      expect(console.error).toHaveBeenCalledWith("'yarn' must be installed to use the CLI.");
    });
  });

  describe('PackageManagerExec', () => {
    it('uses the exec command of the package manager Nx detects', async () => {
      const root = mkdtempSync(join(tmpdir(), 'pm-exec-'));
      writeFileSync(join(root, 'package-lock.json'), '{}');
      (childProcess.spawn as jest.Mock).mockImplementation((() => {
        const s: any = new EventEmitter();
        s.stdout = new EventEmitter();
        setImmediate(() => s.emit('close', 0));
        return s;
      }) as any);
      await expect(PackageManagerExec([ 'localazy', 'download' ], root)).resolves.toBe(0);
      // nx.json cli.packageManager wins over the lockfile, so compare with the Nx detection
      const exec = getPackageManagerCommand(detectPackageManager(root), root).exec;
      expect(childProcess.spawn).toHaveBeenLastCalledWith(exec, [ 'localazy', 'download' ], expect.objectContaining({ shell: true }));
    });
  });
});
