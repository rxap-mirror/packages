import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, writeJson } from '@nx/devkit';
import { BuildNestControllerName } from './build-nest-controller-name';
import { CoerceIgnorePattern } from './coerce-ignore-pattern';
import { RemoveIgnorePattern } from './remove-ignore-pattern';
import { CoerceLernaJson } from './coerce-lerna-json';
import { CoerceProjectTags } from './coerce-project-tags';
import { DeleteTarget } from './delete-target';
import { RemoveTarget } from './remove-target';
import { GetDefaultGeneratorOptions } from './get-default-generator-options';
import { GetNxJson, UpdateNxJson } from './nx-json-file';
import { GetMajorNxVersion, GetNxVersion } from './get-nx-version';
import { GetWorkspaceName } from './get-workspace-name';
import { GetWorkspaceScope } from './get-workspace-scope';
import { HasComponents } from './has-components';
import { HasTarget } from './has-target';
import { IsAlreadyExecuted } from './is-already-executed';
import { IsBuildable } from './is-buildable';
import { isJetbrainsProject } from './is-jetbrains-project';
import { IsRxapRepository } from './is-rxap-repository';
import { IsStandaloneWorkspace } from './is-standalone-workspace';
import { ProcessBuildArgs } from './process-build-args';
import {
  AssertProjectType, FindProject, FindProjectByPath, ForEachProject, GetProject, GetProjectByPackageName,
  GetProjectPackageJson, GetProjectPeerDependencies, GetProjectPrefix, GetProjectRoot, GetProjectSourceRoot,
  GetProjectType, GetRelativePathToProjectRoot, GetWorkspaceProject, GetWorkspaceProjectName, HasProject,
  HasProjectPackageJson, HasProjectSourceRoot, HasWorkspaceProject, IsProjectType, UpdateProjectConfiguration,
  UpdateProjectPackageJson, PROJECT_NAME_TO_PROJECT_LOCATION_CACHE, PROJECT_LOCATION_TO_PROJECT_NAME_CACHE,
  PACKAGE_NAME_TO_PROJECT_LOCATION_CACHE, PROJECT_LOCATION_CACHE_LIST,
} from './get-project';
import { BuildAngularBasePath } from './build-angular-base-path';
import { BuildNestBasePath } from './build-nest-base-path';
import { GetLibraryPathAliasName } from './get-library-path-alias-name';
import { HasMigrations } from './has-project-feature';
import { IsPublishable } from './is-publishable';
import { ForEachSecondaryEntryPoint } from './for-each-secondary-entry-point';
import * as isProject from './is-project';
import { GetJsonFile, HasJsonFile, UpdateJsonFile } from './json-file';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('simple project helpers', () => {
  it('CoerceProjectTags keeps tags unique', () => {
    const project: any = { tags: ['a'] };
    CoerceProjectTags(project, ['a', 'b']);
    expect(project.tags).toEqual(['a', 'b']);
    const empty: any = {};
    CoerceProjectTags(empty, ['x']);
    expect(empty.tags).toEqual(['x']);
  });

  it('DeleteTarget and RemoveTarget remove existing targets', () => {
    const project: any = { targets: { build: {}, test: {} } };
    DeleteTarget(project, 'build');
    DeleteTarget(project, 'missing');
    RemoveTarget(project, 'test');
    RemoveTarget({}, 'x');
    expect(project.targets).toEqual({});
  });

  it('HasTarget works with a project or a tree', () => {
    expect(HasTarget({ targets: { build: {} } }, 'build')).toBe(true);
    expect(HasTarget({}, 'build')).toBe(false);
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'libs/a/project.json', { name: 'a', root: 'libs/a', targets: { build: {} } });
    expect(HasTarget(tree, 'a', 'build')).toBe(true);
    expect(HasTarget(tree, 'a', 'test')).toBe(false);
    expect(() => (HasTarget as any)(tree, 'a')).toThrow('target name');
  });

  it('IsAlreadyExecuted only returns true for repeated keys', () => {
    const key = `k-${Math.random()}`;
    expect(IsAlreadyExecuted(key)).toBe(false);
    expect(IsAlreadyExecuted(key)).toBe(true);
  });

  it('IsBuildable checks the build target or tsconfig.lib.json', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(IsBuildable(tree, { root: 'a', targets: { build: {} } })).toBe(true);
    expect(IsBuildable(tree, { root: 'a' })).toBe(false);
    tree.write('a/tsconfig.lib.json', '{}');
    expect(IsBuildable(tree, { root: 'a' })).toBe(true);
  });

  it('isJetbrainsProject checks the idea modules file', () => {
    const tree = createTreeWithEmptyWorkspace();
    expect(isJetbrainsProject(tree)).toBe(false);
    tree.write('.idea/modules.xml', '');
    expect(isJetbrainsProject(tree)).toBe(true);
  });
});

describe('is-project', () => {
  it('classifies projects by tags and type', () => {
    expect(isProject.IsAngularProject({ tags: ['ngx'] })).toBe(true);
    expect(isProject.IsAngularProject({ tags: ['angular'] })).toBe(true);
    expect(isProject.IsAngularProject({})).toBe(false);
    expect(isProject.IsAngularMaterialProject({ tags: ['angular', 'material'] })).toBe(true);
    expect(isProject.IsAngularMaterialProject({ tags: ['material'] })).toBe(false);
    expect(isProject.IsNestJsProject({ tags: ['nest'] })).toBe(true);
    expect(isProject.IsNestJsProject({ tags: ['nestjs'] })).toBe(true);
    expect(isProject.IsPluginProject({ tags: ['plugin'] })).toBe(true);
    expect(isProject.IsN8NProject({ tags: ['n8n'] })).toBe(true);
    expect(isProject.IsN8nProject({ tags: ['n8n'] })).toBe(true);
    expect(isProject.IsN8NNodesProject({ tags: ['n8n'], name: 'n8n-nodes-x' })).toBe(true);
    expect(isProject.IsN8NNodesProject({ tags: ['n8n'], name: 'n8n-x' })).toBe(false);
    expect(isProject.IsPresetProject({ tags: ['preset'] })).toBe(true);
    expect(isProject.IsSchematicProject({ tags: ['schematic'] })).toBe(true);
    expect(isProject.IsInternalProject({ tags: ['internal'] })).toBe(true);
    expect(isProject.IsGeneratorProject({ tags: ['generator'] })).toBe(true);
    expect(isProject.IsNodeProject({ tags: ['node'] })).toBe(true);
    expect(isProject.IsUtilitiesProject({ tags: ['utilities'] })).toBe(true);
    expect(isProject.IsDataStructureProject({ tags: ['data-structure'] })).toBe(true);
    expect(isProject.IsWorkspaceProject({ root: '.' })).toBe(true);
    expect(isProject.IsWorkspaceProject({ root: 'libs/a' })).toBe(false);
    expect(isProject.IsWorkspaceProject({})).toBe(false);
    expect(isProject.IsApplicationProject({ projectType: 'application' })).toBe(true);
    expect(isProject.IsLibraryProject({ projectType: 'library' })).toBe(true);
    expect(isProject.IsUserInterfaceProject({ projectType: 'application', tags: ['angular'] })).toBe(true);
    expect(isProject.IsUserInterfaceProject({ projectType: 'application', tags: ['user-interface'] })).toBe(true);
    expect(isProject.IsUserInterfaceProject({ projectType: 'library', tags: ['angular'] })).toBe(false);
    expect(isProject.IsServiceProject({ projectType: 'application', tags: ['nest'] })).toBe(true);
    expect(isProject.IsServiceProject({ projectType: 'application', tags: ['service'] })).toBe(true);
    expect(isProject.IsServiceProject({ projectType: 'library', tags: ['nest'] })).toBe(false);
  });
});

describe('BuildNestControllerName', () => {
  it.each([
    [{ controller: 'user', module: 'admin', prefix: true }, 'admin-user'],
    [{ controller: 'admin-user', module: 'admin', prefix: true }, 'admin-user'],
    [{ controller: 'user', prefix: false }, 'user'],
    [{ controller: 'user', prefix: 'api' }, 'api-user'],
    [{ module: 'admin', prefix: true }, 'admin'],
    [{ module: 'admin' }, 'admin'],
    [{ controllerName: 'user', nestModule: 'admin', prefix: true }, 'admin-user'],
    [{ controller: 'user', prefix: false, controllerNameSuffix: 'controller' }, 'user-controller'],
    [{ controller: 'user', prefix: false, controllerNameSuffix: '-controller' }, 'user-controller'],
  ])('builds the name for %j', (options, expected) => {
    expect(BuildNestControllerName(options as any)).toBe(expected);
  });

  it('prefix only (no controller) uses the prefix', () => {
    expect(BuildNestControllerName({ prefix: 'api' })).toBe('api');
  });

  it('throws without a name or with a trailing dash', () => {
    expect(() => BuildNestControllerName({})).toThrow('Could not determine');
    expect(() => BuildNestControllerName({ controller: 'a-', prefix: false })).toThrow('end with a dash');
  });

  it('logs in debug mode', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.env['RXAP_GENERATOR_DEBUG'] = 'true';
    try {
      BuildNestControllerName({ controller: 'admin-user', module: 'admin', prefix: true });
      BuildNestControllerName({ prefix: 'api' });
      BuildNestControllerName({ controller: 'user', prefix: 'api' });
      BuildNestControllerName({ module: 'x' });
      BuildNestControllerName({ controller: 'x', prefix: false });
      expect(() => BuildNestControllerName({ controller: 'a-', prefix: false })).toThrow();
    } finally {
      delete process.env['RXAP_GENERATOR_DEBUG'];
      spy.mockRestore();
      warn.mockRestore();
    }
  });
});

describe('ignore patterns', () => {
  let tree: Tree;
  beforeEach(() => { tree = createTreeWithEmptyWorkspace(); });

  it('CoerceIgnorePattern appends missing patterns once', () => {
    tree.write('.gitignore', 'a');
    CoerceIgnorePattern(tree, '.gitignore', ['a', 'b']);
    CoerceIgnorePattern(tree, '.gitignore', ['b']);
    expect(tree.read('.gitignore', 'utf-8')).toBe('a\nb\n');
    CoerceIgnorePattern(tree, '.new', ['x']);
    expect(tree.read('.new', 'utf-8')).toBe('\nx\n');
  });

  it('RemoveIgnorePattern removes exact lines', () => {
    tree.write('.gitignore', 'a\n b \nc');
    RemoveIgnorePattern(tree, '.gitignore', ['b', 'x']);
    expect(tree.read('.gitignore', 'utf-8')).toBe('a\nc');
    RemoveIgnorePattern(tree, 'missing', ['a']);
    expect(tree.exists('missing')).toBe(false);
  });
});

describe('CoerceLernaJson', () => {
  it('creates and normalizes lerna.json', () => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'lerna.json', { useWorkspaces: true, version: '1.0.0', command: { version: { allowBranch: ['x'] } } });
    CoerceLernaJson(tree);
    const lerna = GetJsonFile(tree, 'lerna.json');
    expect(lerna.useWorkspaces).toBeUndefined();
    expect(lerna.version).toBe('1.0.0');
    expect(lerna.npmClient).toBe('yarn');
    expect(lerna.command.version.allowBranch).toEqual(expect.arrayContaining(['x', 'development']));
    expect(lerna.command.version.ignoreChanges).toContain('**/*.md');
  });

  it('creates the file in a base dir', () => {
    const tree = createTreeWithEmptyWorkspace();
    CoerceLernaJson(tree, 'sub');
    expect(GetJsonFile(tree, 'sub/lerna.json').version).toBe('independent');
  });
});

describe('nx.json and versions', () => {
  it('reads default generator options', () => {
    const tree = createTreeWithEmptyWorkspace();
    UpdateNxJson(tree, (nx: any) => { nx.generators = { g: { a: 1 } }; });
    expect(GetNxJson(tree).generators).toEqual({ g: { a: 1 } });
    expect(GetDefaultGeneratorOptions(tree, 'g')).toEqual({ a: 1 });
    expect(GetDefaultGeneratorOptions(tree, 'other')).toEqual({});
  });

  it('reads the nx version', () => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { devDependencies: { nx: '^20.1.2' } });
    expect(GetNxVersion(tree)).toBe('^20.1.2');
    expect(GetMajorNxVersion(tree)).toBe(20);
  });

  it('handles missing nx version information', () => {
    const tree = createTreeWithEmptyWorkspace();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    writeJson(tree, 'package.json', { name: 'x' });
    expect(() => GetNxVersion(tree)).toThrow('devDependencies property');
    writeJson(tree, 'package.json', { devDependencies: [] });
    expect(() => GetNxVersion(tree)).toThrow('not a valid JSON object');
    writeJson(tree, 'package.json', { devDependencies: {} });
    expect(GetNxVersion(tree)).toBe('latest');
    expect(() => GetMajorNxVersion(tree)).toThrow('Unable to parse');
    log.mockRestore();
  });
});

describe('workspace name and scope', () => {
  const treeWith = (name?: string) => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', name === undefined ? {} : { name });
    return tree;
  };

  it.each([
    ['@scope/source', 'scope'],
    ['@scope/project', 'project'],
    ['plain', 'plain'],
  ])('GetWorkspaceName(%s) = %s', (name, expected) => {
    expect(GetWorkspaceName(treeWith(name))).toBe(expected);
  });

  it('GetWorkspaceScope derives the scope', () => {
    expect(GetWorkspaceScope(treeWith('@scope/project'))).toBe('@scope');
    expect(GetWorkspaceScope(treeWith('plain'))).toBe('@plain');
    expect(() => GetWorkspaceScope(treeWith())).toThrow('name property');
  });
});

describe('IsRxapRepository', () => {
  it('checks the repository url in a tree', () => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', { repository: { url: 'https://gitlab.com/rxap/packages.git' } });
    expect(IsRxapRepository(tree)).toBe(true);
    writeJson(tree, 'package.json', {});
    expect(IsRxapRepository(tree)).toBe(false);
  });

  it('checks a directory', () => {
    expect(IsRxapRepository(process.cwd())).toBeDefined();
    expect(() => IsRxapRepository('/does/not/exist')).toThrow('No package.json found');
  });
});

describe('ProcessBuildArgs', () => {
  it('adds default args and resolves env values', () => {
    const result = ProcessBuildArgs(['A=1', 'B', 'C'], 'proj', 'src', { B: 'bee' });
    expect(result).toEqual(['PROJECT_NAME=proj', 'RELEASE=$CI_COMMIT_REF_NAME', 'A=1', 'B=bee']);
  });

  it('warns for undefined env values', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    ProcessBuildArgs(['X'], 'p', 'src', {});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("'X'"));
    warn.mockRestore();
  });

  it('keeps = inside values', () => {
    expect(ProcessBuildArgs(['A=b=c'], 'p', 's', {})).toContain('A=b=c');
  });

  it('normalizes PATH_PREFIX', () => {
    expect(ProcessBuildArgs(['PATH_PREFIX=app'], 'p', 's', {})).toContain('PATH_PREFIX=/app');
    expect(ProcessBuildArgs(['PATH_PREFIX=/'], 'p', 's', {}).some((a) => a.startsWith('PATH_PREFIX'))).toBe(false);
    expect(ProcessBuildArgs(['PATH_PREFIX='], 'p', 's', {}).some((a) => a.startsWith('PATH_PREFIX'))).toBe(false);
  });

  it('resolves REGEX values from files', () => {
    const exists = jest.fn(() => true);
    const read = jest.fn(() => 'version: 1.2.3\n');
    expect(ProcessBuildArgs(['V=REGEX:file.txt:version: (\\d+\\.\\d+\\.\\d+)'], 'p', 'src', {}, exists, read)).toContain('V=1.2.3');
    expect(ProcessBuildArgs(['V=REGEX:file.txt:version'], 'p', 'src', {}, exists, read)).toContain('V=version');
  });

  it('rejects invalid REGEX values', () => {
    const read = () => 'x';
    expect(() => ProcessBuildArgs(['V=REGEX:file'], 'p', 's', {}, () => true, read)).toThrow('Invalid regex');
    expect(() => ProcessBuildArgs(['V=REGEX:f:a'], 'p', 's', {}, () => false, read)).toThrow('does not exist');
    expect(() => ProcessBuildArgs(['V=REGEX:f:zzz'], 'p', 's', {}, () => true, read)).toThrow('Could not find match');
  });
});

describe('json-file', () => {
  it('detects, reads and updates json files', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('bad.json', '{');
    tree.write('ok.json', '{"a":1}');
    expect(HasJsonFile(tree, 'missing.json')).toBe(false);
    expect(HasJsonFile(tree, 'bad.json')).toBe(false);
    expect(HasJsonFile(tree, 'ok.json')).toBe(true);
    expect(() => GetJsonFile(tree, 'missing.json')).toThrow('does not exists');
    expect(GetJsonFile(tree, 'created.json', true)).toEqual({});
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(() => GetJsonFile(tree, 'bad.json')).toThrow('Could not parse');
    log.mockRestore();

    UpdateJsonFile(tree, (j: any) => { j.b = 2; }, 'ok.json');
    expect(JSON.parse(tree.read('ok.json', 'utf-8')!)).toEqual({ a: 1, b: 2 });
    expect(tree.read('ok.json', 'utf-8')!.endsWith('\n')).toBe(true);
    await UpdateJsonFile(tree, async (j: any) => { j.c = 3; }, 'ok.json', { space: 4 });
    expect(JSON.parse(tree.read('ok.json', 'utf-8')!)).toEqual({ a: 1, b: 2, c: 3 });
    UpdateJsonFile(tree, { z: 1 } as any, 'ok.json');
    expect(JSON.parse(tree.read('ok.json', 'utf-8')!)).toEqual({ z: 1 });
    UpdateJsonFile(tree, (j: any) => j, 'new.json', { create: true });
    expect(tree.exists('new.json')).toBe(true);
  });
});

describe('project lookup', () => {
  let tree: Tree;

  beforeEach(() => {
    PROJECT_NAME_TO_PROJECT_LOCATION_CACHE.clear();
    PROJECT_LOCATION_TO_PROJECT_NAME_CACHE.clear();
    PACKAGE_NAME_TO_PROJECT_LOCATION_CACHE.clear();
    PROJECT_LOCATION_CACHE_LIST.length = 0;
    tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'libs/a/project.json', {
      name: 'a', root: 'libs/a', sourceRoot: 'libs/a/src', projectType: 'library', prefix: 'rx', tags: ['angular'],
      targets: { build: {} },
    });
    writeJson(tree, 'libs/a/package.json', { name: '@scope/a', peerDependencies: { x: '1' } });
    writeJson(tree, 'apps/b/project.json', { name: 'b', root: 'apps/b', projectType: 'application' });
    writeJson(tree, 'libs/c/project.json', { name: 'c', root: 'libs/c', projectType: 'weird' });
    writeJson(tree, 'libs/d/project.json', { name: 'd', root: 'libs/d' });
  });

  it('finds projects and roots', () => {
    expect(FindProject(tree, 'a')!.root).toBe('libs/a');
    expect(HasProject(tree, 'a')).toBe(true);
    expect(HasProject(tree, 'zzz')).toBe(false);
    expect(GetProject(tree, 'a').name).toBe('a');
    expect(() => GetProject(tree, 'zzz')).toThrow('does not exists');
    expect(GetProjectRoot(tree, 'a')).toBe('libs/a');
    expect(GetProjectRoot({ root: 'x' })).toBe('x');
    expect(() => GetProjectRoot(tree, '')).toThrow('projectName');
    expect(() => GetProjectRoot({})).toThrow('root path');
    expect(FindProjectByPath(tree, 'libs/a')!.name).toBe('a');
    expect(FindProjectByPath(tree, 'libs/a/src/deep', true)!.name).toBe('a');
    expect(FindProjectByPath(tree, 'nowhere')).toBeNull();
    expect([...ForEachProject(tree)].map((p) => p.name).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('reads project properties', () => {
    expect(GetProjectPrefix(tree, 'a')).toBe('rx');
    expect(GetProjectPrefix(tree, 'b', 'def')).toBe('def');
    expect(() => GetProjectPrefix(tree, 'b')).toThrow('does not have a prefix');
    expect(GetProjectType(tree, 'a')).toBe('library');
    expect(() => GetProjectType(tree, 'd')).toThrow('does not have a project type');
    expect(() => GetProjectType(tree, 'c')).toThrow('unknown type');
    expect(IsProjectType(tree, 'b', 'application')).toBe(true);
    expect(() => AssertProjectType(tree, 'b', 'library')).toThrow("not the type 'library'");
    expect(() => AssertProjectType(tree, 'a', 'library')).not.toThrow();
    expect(GetProjectSourceRoot(tree, 'a')).toBe('libs/a/src');
    expect(() => GetProjectSourceRoot(tree, 'b')).toThrow('source root');
    expect(() => GetProjectSourceRoot(tree, '')).toThrow('projectName');
    expect(GetProjectSourceRoot({ root: 'r', sourceRoot: 's' })).toBe('s');
    expect(GetProjectSourceRoot({ root: 'r' })).toBe('r/src');
    expect(GetProjectSourceRoot({ root: 'r' }, 'lib')).toBe('r/lib');
    expect(HasProjectSourceRoot(tree, 'a')).toBe(true);
    expect(HasProjectSourceRoot(tree, 'b')).toBe(false);
    expect(GetRelativePathToProjectRoot(tree, 'a')).toBe('../..');
  });

  it('reads project package json files', () => {
    expect(HasProjectPackageJson(tree, 'a')).toBe(true);
    expect(HasProjectPackageJson(tree, 'b')).toBe(false);
    expect(GetProjectPackageJson(tree, 'a').name).toBe('@scope/a');
    expect(GetProjectPeerDependencies(tree, 'a')).toEqual({ x: '1' });
    expect(GetLibraryPathAliasName(tree, 'a')).toBe('@scope/a');
    expect(GetLibraryPathAliasName(tree, 'b')).toBe('b');
    expect(GetProjectByPackageName(tree, '@scope/a')!.name).toBe('a');
    expect(GetProjectByPackageName(tree, '@scope/a')!.name).toBe('a');
    expect(GetProjectByPackageName(tree, '@scope/none')).toBeNull();
  });

  it('knows about the workspace project', () => {
    expect(HasWorkspaceProject(tree)).toBe(false);
    expect(() => GetWorkspaceProject(tree)).toThrow('workspace project');
    expect(() => GetWorkspaceProjectName(tree)).toThrow('workspace project');
    expect(IsStandaloneWorkspace(tree)).toBe(false);
    writeJson(tree, 'project.json', { name: 'ws', targets: { build: {} } });
    expect(HasWorkspaceProject(tree)).toBe(true);
    expect(GetWorkspaceProjectName(tree)).toBe('ws');
    expect(GetWorkspaceProject(tree).name).toBe('ws');
    expect(IsStandaloneWorkspace(tree)).toBe(false);
    writeJson(tree, 'project.json', { name: 'ws', targets: { build: {}, serve: {} } });
    expect(IsStandaloneWorkspace(tree)).toBe(true);
  });

  it('updates project configuration and package json', async () => {
    await UpdateProjectConfiguration(tree, (p) => { p.tags = ['x']; }, { projectName: 'a' });
    expect(JSON.parse(tree.read('libs/a/project.json', 'utf-8')!).tags).toEqual(['x']);
    expect(JSON.parse(tree.read('libs/a/project.json', 'utf-8')!).root).toBeUndefined();
    const before = tree.read('libs/a/project.json', 'utf-8');
    await UpdateProjectConfiguration(tree, () => undefined, { projectName: 'a' });
    expect(tree.read('libs/a/project.json', 'utf-8')).toBe(before);
    await UpdateProjectPackageJson(tree, (p) => { p.description = 'desc'; }, { projectName: 'a' });
    expect(JSON.parse(tree.read('libs/a/package.json', 'utf-8')!).description).toBe('desc');
  });

  it('builds angular base paths', () => {
    writeJson(tree, 'libs/shared/project.json', { name: 'shared', root: 'libs/shared', sourceRoot: 'libs/shared/src', projectType: 'library' });
    writeJson(tree, 'apps/b/project.json', { name: 'b', root: 'apps/b', sourceRoot: 'apps/b/src', projectType: 'application' });
    expect(BuildAngularBasePath(tree, { project: 'a', directory: 'x' })).toBe('libs/a/src/lib/x');
    expect(BuildAngularBasePath(tree, { project: 'a', directory: 'lib/x' })).toBe('libs/a/src/lib/x');
    expect(BuildAngularBasePath(tree, { project: 'a', feature: 'f' })).toBe('libs/a/src/lib/feature/f');
    expect(BuildAngularBasePath(tree, { project: 'b', feature: 'f', directory: 'd' })).toBe('apps/b/src/feature/f/d');
    expect(BuildAngularBasePath(tree, { project: 'x', shared: true })).toBe('libs/shared/src/lib');
    expect(BuildAngularBasePath(tree, { project: 'a', entrypoint: 'testing', directory: 'd' })).toBe('libs/a/testing/src/lib/d');
    expect(() => BuildAngularBasePath(tree, { project: 'a', entrypoint: 'e', feature: 'f' })).toThrow('not supported with the entrypoint');
    expect(() => BuildAngularBasePath(tree, { project: 'b', entrypoint: 'e' })).toThrow('only supported for library');
  });

  it('builds nest base paths', () => {
    writeJson(tree, 'libs/api-x/project.json', { name: 'api-x', root: 'libs/api-x', sourceRoot: 'libs/api-x/src', projectType: 'library' });
    writeJson(tree, 'apps/api-y/project.json', { name: 'api-y', root: 'apps/api-y', sourceRoot: 'apps/api-y/src', projectType: 'application' });
    const spy = jest.requireActual('./project-utilities');
    const lib = BuildNestBasePath(tree, { project: 'x', backend: { project: 'api-x' } as any, directory: 'd' });
    expect(typeof lib).toBe('string');
    expect(spy).toBeDefined();
  });

  it('checks migrations and publishability', () => {
    expect(HasMigrations(tree, { name: 'a' })).toBe(false);
    tree.write('libs/a/migrations.json', '{}');
    expect(HasMigrations(tree, { name: 'a' })).toBe(true);
    tree.write('libs/c/src/migrations/x.ts', '');
    expect(HasMigrations(tree, { name: 'c' })).toBe(true);

    const project = GetProject(tree, 'a');
    expect(IsPublishable(tree, project)).toBe(true);
    writeJson(tree, 'libs/a/package.json', { name: '@scope/a', private: true });
    expect(IsPublishable(tree, project)).toBe(false);
    expect(IsPublishable(tree, GetProject(tree, 'b'))).toBe(false);
    expect(IsPublishable(tree, { ...project, root: 'libs/nopkg' })).toBe(false);
  });

  it('finds components and secondary entry points', () => {
    expect(HasComponents(tree, 'libs/a')).toBe(false);
    tree.write('libs/a/src/x.component.ts', '');
    expect(HasComponents(tree, 'libs/a')).toBe(true);

    tree.write('libs/e/testing/ng-package.json', '{}');
    tree.write('libs/e/package.json', '{}');
    expect([...ForEachSecondaryEntryPoint(tree, 'libs/e')].length).toBeGreaterThanOrEqual(0);
  });
});
