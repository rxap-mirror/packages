import {
  callRule,
  HostTree,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { firstValueFrom } from 'rxjs';
import { CheckIfPackagesAreInstalled } from './check-if-packages-are-installed';
import { CoerceFile } from './coerce-file';
import {
  CollectionJsonType,
  GetProjectCollectionJson,
  GetProjectCollectionJsonFilePath,
  HasProjectCollectionJsonFile,
  UpdateCollectionJson,
} from './collection-json-file';
import {
  BuildersJsonType,
  GetProjectBuildersJson,
  GetProjectBuildersJsonFilePath,
  UpdateBuildersJson,
} from './builders-json-file';
import { DeleteDirectory } from './delete-directory';
import { DeleteRecursive } from './file';
import {
  NormalizeGlobalOptions,
  PrintGeneralOptions,
} from './gernal-options';
import {
  FindProject,
  GetDefaultPrefix,
  GetDefaultProject,
  GetDefaultProjectName,
  GetProject,
  GetProjectPackageJson,
  GetProjectPeerDependencies,
  GetProjectPrefix,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetProjectType,
  GetRelativePathToProjectRoot,
  HasProject,
  HasProjectSourceRoot,
  IsProjectType,
  AssertProjectType,
} from './get-project';
import { GuessBuilderRoot } from './guess-builder-root';
import { GuessProjectName } from './guess-project-name';
import { GuessProjectRoot } from './guess-project-root';
import { GuessProjectSourceRoot } from './guess-project-source-root';
import { GuessSchematicRoot } from './guess-schematic-root';
import {
  GetJsonFile,
  HasJsonFile,
  UpdateJsonFileRule,
} from './json-file';
import {
  GetNxJson,
  UpdateNxJsonRule,
} from './nx-json-file';
import {
  AddPackageJsonDependencyRule,
  AddPackageJsonDevDependencyRule,
  AddPackageJsonScriptRule,
  GetPackageJson,
  InstallNodePackages,
  InstallPackageIfNotExistsRule,
  UpdatePackageJsonRule,
} from './package-json-file';
import { InstallPeerDependencies } from './install-peer-dependencies';
import { SearchFile } from './search-file';
import { GetWorkspace } from './workspace';
import { ExecuteExternalSchematic, ExecuteSchematic } from './execute-schematic';

// avoid npm registry lookups for peer dependencies
jest.mock('@rxap/node-utilities', () => ({
  ...jest.requireActual('@rxap/node-utilities'),
  GetPackagePeerDependencies: jest.fn(async () => ({})),
  GetLatestPackageVersion: jest.fn(async () => '1.0.0'),
}));

const ctx = (): SchematicContext => ({
  addTask: jest.fn(() => ({ id: 1 })),
  logger: { warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
  schematic: { description: { collection: { name: '@rxap/does-not-exist' } } },
} as any);

async function run(rule: any, tree: Tree, context = ctx()): Promise<Tree> {
  const result = callRule(rule, tree, context);
  return (await firstValueFrom(result as any)) as Tree;
}

function workspaceTree(): Tree {
  const tree = new HostTree();
  tree.create('package.json', JSON.stringify({ name: 'root', dependencies: { a: '1' }, devDependencies: {} }));
  tree.create('nx.json', JSON.stringify({ npmScope: 'x' }));
  tree.create('libs/lib-a/project.json', JSON.stringify({
    name: 'lib-a', root: 'libs/lib-a', sourceRoot: 'libs/lib-a/src', projectType: 'library', prefix: 'la',
  }));
  tree.create('libs/lib-a/package.json', JSON.stringify({
    name: '@x/lib-a',
    schematics: './collection.json',
    builders: './builders.json',
    'ng-update': { migrations: './migrations.json' },
    peerDependencies: { rxjs: '^7' },
  }));
  tree.create('libs/lib-a/collection.json', JSON.stringify({
    schematics: { gen: { factory: './src/schematics/gen/index', schema: './src/schematics/gen/schema.json' } },
  }));
  tree.create('libs/lib-a/builders.json', JSON.stringify({
    builders: { b: { implementation: './src/builders/b/index', schema: './src/builders/b/schema.json' } },
  }));
  tree.create('apps/app-b/project.json', JSON.stringify({ name: 'app-b', root: 'apps/app-b', projectType: 'application' }));
  tree.create('apps/app-b/package.json', JSON.stringify({ name: 'app-b' }));
  tree.create('apps/app-c/project.json', JSON.stringify({ name: 'app-c', projectType: 'weird', sourceRoot: 'apps/app-c/src' }));
  tree.create('workspace.json', JSON.stringify({
    version: 1,
    projects: {
      'lib-a': { root: 'libs/lib-a', sourceRoot: 'libs/lib-a/src', projectType: 'library', prefix: 'la' },
      'app-b': { root: 'apps/app-b', projectType: 'application', prefix: 'ab' },
    },
  }));
  return tree;
}

describe('schematic tree utilities', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  describe('json-file', () => {
    it('HasJsonFile / GetJsonFile', () => {
      const tree = new HostTree();
      tree.create('a.json', '{"a":1}');
      tree.create('bad.json', '{');
      expect(HasJsonFile(tree, 'a.json')).toBe(true);
      expect(HasJsonFile(tree, 'bad.json')).toBe(false);
      expect(HasJsonFile(tree, 'none.json')).toBe(false);
      expect(GetJsonFile(tree, 'a.json')).toEqual({ a: 1 });
      expect(() => GetJsonFile(tree, 'none.json')).toThrow('does not exists');
      expect(GetJsonFile(tree, 'new.json', true)).toEqual({});
      expect(tree.exists('new.json')).toBe(true);
      expect(() => GetJsonFile(tree, 'bad.json')).toThrow('Could not parse');
    });
    it('UpdateJsonFileRule updates a file', async () => {
      const tree = new HostTree();
      tree.create('a.json', '{"a":1}');
      await run(UpdateJsonFileRule((j: any) => { j.b = 2; }, 'a.json'), tree);
      expect(JSON.parse(tree.readText('a.json'))).toEqual({ a: 1, b: 2 });
    });
  });

  describe('package.json rules', () => {
    it('reads and updates package.json', async () => {
      const tree = workspaceTree();
      expect(GetPackageJson(tree).name).toBe('root');
      expect(GetPackageJson(tree, 'libs/lib-a').name).toBe('@x/lib-a');
      await run(UpdatePackageJsonRule(p => { p.version = '1.0.0'; }), tree);
      expect(GetPackageJson(tree).version).toBe('1.0.0');
    });
    it('adds scripts and dependencies', async () => {
      const tree = workspaceTree();
      await run(AddPackageJsonScriptRule('build', 'nx build'), tree);
      await run(AddPackageJsonDependencyRule('dep', '2.0.0'), tree);
      await run(AddPackageJsonDevDependencyRule('dev', '3.0.0'), tree);
      const pkg = GetPackageJson(tree);
      expect(pkg.scripts?.['build']).toBe('nx build');
      expect(pkg.dependencies?.['dep']).toBe('2.0.0');
      expect(pkg.devDependencies?.['dev']).toBe('3.0.0');
    });
    it('InstallPackageIfNotExistsRule adds only missing packages and schedules install', async () => {
      const tree = workspaceTree();
      const context = ctx();
      await run(InstallPackageIfNotExistsRule('a', '1'), tree, context);
      expect(context.addTask).not.toHaveBeenCalled();
      await run(InstallPackageIfNotExistsRule('new', '1'), tree, context);
      expect(GetPackageJson(tree).dependencies?.['new']).toBe('1');
      expect(context.addTask).toHaveBeenCalledTimes(1);
      await run(InstallPackageIfNotExistsRule('newdev', '1', true), tree, context);
      expect(GetPackageJson(tree).devDependencies?.['newdev']).toBe('1');
      expect(context.addTask).toHaveBeenCalledTimes(2);
    });
    it('InstallNodePackages schedules a task', async () => {
      const context = ctx();
      await run(InstallNodePackages(), new HostTree(), context);
      expect(context.addTask).toHaveBeenCalled();
    });
    it('CheckIfPackagesAreInstalled throws for packages neither referenced nor installed', async () => {
      const tree = workspaceTree();
      await expect(run(CheckIfPackagesAreInstalled([ 'a' ]), tree)).resolves.toBeDefined();
      await expect(run(CheckIfPackagesAreInstalled([ 'definitely-not-installed-pkg' ]), tree)).rejects.toThrow('not installed');
      // installed but not referenced: only warns
      await expect(run(CheckIfPackagesAreInstalled([ 'rxjs' ]), tree)).resolves.toBeDefined();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('InstallPeerDependencies', () => {
    it('does nothing when the collection package.json cannot be loaded', async () => {
      const context = ctx();
      await run(InstallPeerDependencies(), new HostTree(), context);
      expect(context.addTask).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Could not load schematic package.json'));
    });
  });

  describe('nx.json', () => {
    it('reads and updates', async () => {
      const tree = workspaceTree();
      expect(GetNxJson(tree)).toEqual({ npmScope: 'x' });
      await run(UpdateNxJsonRule((n: any) => { n.defaultBase = 'main'; }), tree);
      expect((GetNxJson(tree) as any).defaultBase).toBe('main');
    });
  });

  describe('project lookup', () => {
    it('finds and reads projects', () => {
      const tree = workspaceTree();
      expect(FindProject(tree, 'lib-a')?.root).toBe('libs/lib-a');
      expect(FindProject(tree, 'nope')).toBeNull();
      expect(HasProject(tree, 'app-b')).toBe(true);
      expect(HasProject(tree, 'nope')).toBe(false);
      expect(() => GetProject(tree, 'nope')).toThrow('does not exists');
      expect(GetProject(tree, 'app-c').root).toBe('apps/app-c');
      expect(GetProjectRoot(tree, 'lib-a')).toBe('libs/lib-a');
      expect(GetProjectSourceRoot(tree, 'lib-a')).toBe('libs/lib-a/src');
      expect(() => GetProjectSourceRoot(tree, 'app-b')).toThrow('source root');
      expect(HasProjectSourceRoot(tree, 'lib-a')).toBe(true);
      expect(HasProjectSourceRoot(tree, 'app-b')).toBe(false);
      expect(GetRelativePathToProjectRoot(tree, 'lib-a')).toBe('../..');
    });
    it('reads project type, prefix, package.json and peer dependencies', () => {
      const tree = workspaceTree();
      expect(GetProjectType(tree, 'lib-a')).toBe('library');
      expect(() => GetProjectType(tree, 'app-c')).toThrow(`unknown type 'weird'`);
      expect(IsProjectType(tree, 'app-b', 'application')).toBe(true);
      expect(() => AssertProjectType(tree, 'app-b', 'library')).toThrow(`has not the type 'library'`);
      expect(() => AssertProjectType(tree, 'lib-a', 'library')).not.toThrow();
      expect(GetProjectPrefix(tree, 'lib-a')).toBe('la');
      expect(GetProjectPrefix(tree, 'app-b', 'dflt')).toBe('dflt');
      expect(() => GetProjectPrefix(tree, 'app-b')).toThrow('does not have a prefix');
      expect(GetProjectPackageJson(tree, 'lib-a').name).toBe('@x/lib-a');
      expect(GetProjectPeerDependencies(tree, 'lib-a')).toEqual({ rxjs: '^7' });
      expect(GetProjectPeerDependencies(tree, 'app-b')).toEqual({});
    });
    it('GetProjectType throws without type', () => {
      const tree = new HostTree();
      tree.create('x/project.json', JSON.stringify({ name: 'x', root: 'x' }));
      expect(() => GetProjectType(tree, 'x')).toThrow('does not have a project type');
    });
    it('FindProject reports unparsable project files', () => {
      const tree = new HostTree();
      tree.create('zzz/project.json', '{');
      expect(() => FindProject(tree, 'unlikely-name-xyz')).toThrow('Could not parse project configuration');
    });
  });

  describe('workspace file', () => {
    it('GetWorkspace picks a workspace file and default project', () => {
      const tree = workspaceTree();
      const ws = GetWorkspace(tree);
      expect(Array.from(ws.projects.keys())).toEqual([ 'lib-a', 'app-b' ]);
      expect(GetDefaultProjectName(tree)).toBe('lib-a');
      expect(GetDefaultProject(tree)?.root).toBe('libs/lib-a');
      expect(GetDefaultPrefix(tree)).toBe('la');
    });
    it('prefers .angular.json and angular.json, throws if nothing exists', () => {
      const tree = new HostTree();
      expect(() => GetWorkspace(tree)).toThrow('Could not find the workspace configuration');
      tree.create('angular.json', JSON.stringify({ version: 1, projects: { a: { root: 'a' } } }));
      expect(GetWorkspace(tree).projects.has('a')).toBe(true);
      tree.create('.angular.json', JSON.stringify({ version: 1, projects: { b: { root: 'b' } } }));
      expect(GetWorkspace(tree).projects.has('b')).toBe(true);
    });
  });

  describe('collection / builders json', () => {
    it('resolves paths for schematics and migrations', () => {
      const tree = workspaceTree();
      expect(HasProjectCollectionJsonFile(tree, 'lib-a')).toBe(true);
      expect(HasProjectCollectionJsonFile(tree, 'lib-a', CollectionJsonType.MIGRATIONS)).toBe(false);
      expect(HasProjectCollectionJsonFile(tree, 'app-b')).toBe(false);
      expect(() => HasProjectCollectionJsonFile(tree, 'lib-a', 'x' as any)).toThrow('not supported');
      expect(GetProjectCollectionJsonFilePath(tree, 'lib-a')).toBe('libs/lib-a/collection.json');
      expect(() => GetProjectCollectionJsonFilePath(tree, 'lib-a', CollectionJsonType.MIGRATIONS)).toThrow('does not exists');
      expect(GetProjectCollectionJsonFilePath(tree, 'lib-a', CollectionJsonType.MIGRATIONS, true)).toBe('libs/lib-a/migrations.json');
      expect(tree.exists('libs/lib-a/migrations.json')).toBe(true);
      expect(() => GetProjectCollectionJsonFilePath(tree, 'app-b')).toThrow(`does not have a 'schematics' property`);
      expect(() => GetProjectCollectionJsonFilePath(tree, 'lib-a', 'x' as any)).toThrow('not supported');
      expect(Object.keys(GetProjectCollectionJson(tree, 'lib-a').schematics)).toEqual([ 'gen' ]);
    });
    it('UpdateCollectionJson updates the file', async () => {
      const tree = workspaceTree();
      await run(UpdateCollectionJson((c: any) => { c.schematics.other = { factory: './x' }; }, { projectName: 'lib-a' }), tree);
      expect(Object.keys(GetProjectCollectionJson(tree, 'lib-a').schematics)).toEqual([ 'gen', 'other' ]);
    });
    it('builders json', async () => {
      const tree = workspaceTree();
      expect(GetProjectBuildersJsonFilePath(tree, 'lib-a')).toBe('libs/lib-a/builders.json');
      expect(Object.keys(GetProjectBuildersJson(tree, 'lib-a').builders)).toEqual([ 'b' ]);
      expect(() => GetProjectBuildersJsonFilePath(tree, 'app-b')).toThrow(`does not have a 'builders' property`);
      expect(() => GetProjectBuildersJsonFilePath(tree, 'lib-a', 'x' as any)).toThrow('not supported');
      tree.delete('libs/lib-a/builders.json');
      expect(() => GetProjectBuildersJsonFilePath(tree, 'lib-a')).toThrow('does not exists');
      expect(GetProjectBuildersJsonFilePath(tree, 'lib-a', BuildersJsonType.BUILDERS, true)).toBe('libs/lib-a/builders.json');
      await run(UpdateBuildersJson((b: any) => { b.builders = { n: {} }; }, { projectName: 'lib-a' }), tree);
      expect(Object.keys(GetProjectBuildersJson(tree, 'lib-a').builders)).toEqual([ 'n' ]);
    });
  });

  describe('guess helpers', () => {
    it('GuessProjectRoot / Name / SourceRoot', () => {
      const tree = workspaceTree();
      expect(() => GuessProjectRoot(tree, {})).toThrow('At least one of them');
      expect(GuessProjectRoot(tree, { project: 'lib-a' })).toBe('libs/lib-a');
      expect(GuessProjectRoot(tree, { path: '/libs/lib-a/src/x.ts' })).toBe('libs/lib-a');
      expect(() => GuessProjectRoot(tree, { path: '/other/x.ts' })).toThrow('could not be guessed');
      expect(GuessProjectName(tree, { project: 'p' })).toBe('p');
      expect(GuessProjectName(tree, { path: '/apps/app-b/src/x.ts' })).toBe('app-b');
      expect(() => GuessProjectName(tree, {})).toThrow('At least one');
      expect(GuessProjectSourceRoot(tree, { project: 'lib-a' })).toBe('libs/lib-a/src');
    });
    it('GuessProjectRoot prefers the longest match', () => {
      const tree = new HostTree();
      tree.create('workspace.json', JSON.stringify({ version: 2, projects: { a: { root: 'libs' }, b: { root: 'libs/nested' } } }));
      expect(GuessProjectRoot(tree, { path: 'libs/nested/x.ts' })).toBe('libs/nested');
    });
    it('GuessSchematicRoot / GuessBuilderRoot', () => {
      const tree = workspaceTree();
      expect(GuessSchematicRoot(tree, 'lib-a')).toBe('libs/lib-a/src/schematics');
      expect(GuessBuilderRoot(tree, 'lib-a')).toBe('libs/lib-a/src/builders');
      expect(GuessSchematicRoot(tree, 'app-b')).toBe('apps/app-b/src/schematics');
      expect(console.warn).toHaveBeenCalledWith('Could not guess the schematic root.');
      tree.overwrite('libs/lib-a/builders.json', JSON.stringify({ builders: {} }));
      expect(GuessBuilderRoot(tree, 'lib-a')).toBe('libs/lib-a/src/builders');
      expect(console.warn).toHaveBeenCalledWith('Could not guess the builder root.');
    });
  });

  describe('file helpers', () => {
    it('SearchFile skips hidden and node_modules directories', () => {
      const tree = new HostTree();
      tree.create('a.txt', '');
      tree.create('src/b.txt', '');
      tree.create('node_modules/x/c.txt', '');
      tree.create('.hidden/d.txt', '');
      const paths = Array.from(SearchFile(tree.root)).map(f => f.path).sort();
      expect(paths).toEqual([ '/a.txt', '/src/b.txt' ]);
      expect(Array.from(SearchFile(tree.getDir('/pkg/node_modules/x'))).length).toBe(0);
    });
    it('CoerceFile creates, overwrites or keeps', () => {
      const tree = new HostTree();
      expect(CoerceFile(tree, 'a.txt', 'one')).toBe('one');
      expect(CoerceFile(tree, 'a.txt', 'two')).toBe('two');
      expect(CoerceFile(tree, 'a.txt', 'three', false)).toBe('two');
    });
    it('DeleteDirectory / DeleteRecursive remove all files', () => {
      const tree = new HostTree();
      tree.create('d/a.txt', '');
      tree.create('d/s/b.txt', '');
      tree.create('keep.txt', '');
      DeleteDirectory(tree, tree.getDir('d'));
      expect(tree.exists('d/a.txt')).toBe(false);
      expect(tree.exists('d/s/b.txt')).toBe(false);
      expect(tree.exists('keep.txt')).toBe(true);
      tree.create('e/a.txt', '');
      tree.create('e/s/b.txt', '');
      DeleteRecursive(tree, tree.getDir('e'));
      expect(tree.exists('e/a.txt')).toBe(false);
      expect(tree.exists('e/s/b.txt')).toBe(false);
    });
  });

  describe('options and schematic execution', () => {
    it('NormalizeGlobalOptions', () => {
      expect(NormalizeGlobalOptions({ project: 'MyProject', feature: 'myFeature' })).toEqual({
        project: 'my-project', feature: 'my-feature', overwrite: false, replace: false,
      });
      expect(NormalizeGlobalOptions({ project: 'p', overwrite: [ 'a' ], replace: true })).toEqual({
        project: 'p', feature: null, overwrite: [ 'a' ], replace: true,
      });
    });
    it('PrintGeneralOptions logs optional flags', () => {
      PrintGeneralOptions('s', NormalizeGlobalOptions({ project: 'p' }));
      expect(console.log).toHaveBeenCalledTimes(1);
      PrintGeneralOptions('s', NormalizeGlobalOptions({ project: 'p', overwrite: true, replace: true }));
      expect(console.log).toHaveBeenCalledTimes(4);
    });
    it('ExecuteSchematic / ExecuteExternalSchematic return rules', () => {
      expect(typeof ExecuteSchematic('x', { a: 1, b: undefined })).toBe('function');
      expect(typeof ExecuteExternalSchematic('c', 'x', { a: 1 })).toBe('function');
    });
  });
});
