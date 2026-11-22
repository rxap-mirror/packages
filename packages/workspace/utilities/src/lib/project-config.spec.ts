import { addProjectConfiguration, getProjects, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  CreateConfigurationMapMatchingWithTarget,
  GetTarget,
  GetTargetConfigurationNameList,
  GetTargetOptions,
} from './get-target-configuration-name-list';
import { GetMajorAngularSchematicDevkitVersion, GetMajorAngularVersion } from './get-angular-major-version';
import { GetBuildOutputForProject } from './get-build-output-for-project';
import { GetRootDockerOptions } from './get-root-docker-options';
import { ForeachInitProject } from './project/foreach-init-project';
import {
  HasNgPackageJson,
  isNgPackagrProject,
  ReadNgPackageJson,
  UpdateNgPackageJson,
  WriteNgPackageJson,
} from './ng-package-json';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('target configuration helpers', () => {
  const project: any = {
    name: 'p', root: 'libs/p',
    targets: { build: { options: { a: 1 }, configurations: { production: { a: 2 }, dev: {} } }, test: {} },
  };

  it('lists configuration names', () => {
    expect(GetTargetConfigurationNameList(project, 'build')).toEqual(['production', 'dev']);
    expect(GetTargetConfigurationNameList(project, 'test')).toEqual([]);
    expect(GetTargetConfigurationNameList(project, 'missing')).toEqual([]);
    expect(GetTargetConfigurationNameList({ name: 'x', root: '' }, 'build')).toEqual([]);
  });

  it('creates a configuration map for the given target', () => {
    expect(CreateConfigurationMapMatchingWithTarget(project, 'build')).toEqual({ production: {}, dev: {} });
    expect(CreateConfigurationMapMatchingWithTarget(project, 'test')).toEqual({});
  });

  it('gets targets and merged options', () => {
    expect(GetTarget(project, 'test')).toEqual({});
    expect(() => GetTarget(project, 'x')).toThrow("Could not find target 'x' for project 'p'");
    expect(GetTargetOptions({ options: { a: 1 } })).toEqual({ a: 1 });
    expect(GetTargetOptions({})).toEqual({});
    expect(GetTargetOptions({ options: { a: 1 }, configurations: { c: { b: 2 } } }, 'c')).toEqual({ a: 1, b: 2 });
    expect(GetTargetOptions({ options: { a: 1 } }, 'unknown')).toEqual({ a: 1 });
  });
});

describe('angular versions', () => {
  const treeWith = (json: object) => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'package.json', json);
    return tree;
  };

  it('reads the major angular version', () => {
    expect(GetMajorAngularVersion(treeWith({ dependencies: { '@angular/core': '^19.1.0' } }))).toBe(19);
    expect(GetMajorAngularVersion(treeWith({ devDependencies: { '@angular/cli': '~18.0.0' } }))).toBe(18);
    expect(() => GetMajorAngularVersion(treeWith({}))).toThrow('not installed');
    expect(() => GetMajorAngularVersion(treeWith({ dependencies: { '@angular/core': 'latest' } }))).toThrow('Unable to parse');
  });

  it('reads the major schematics devkit version', () => {
    expect(GetMajorAngularSchematicDevkitVersion(treeWith({ devDependencies: { '@angular-devkit/schematics': '^17.2.0' } }))).toBe(17);
    expect(() => GetMajorAngularSchematicDevkitVersion(treeWith({}))).toThrow('not installed');
    expect(() => GetMajorAngularSchematicDevkitVersion(treeWith({ devDependencies: { '@angular-devkit/schematics': 'next' } }))).toThrow('Unable to parse');
  });
});

describe('GetBuildOutputForProject', () => {
  it('falls back to dist/root without build outputs', () => {
    expect(GetBuildOutputForProject({ name: 'p', root: 'libs/p' })).toBe('dist/libs/p');
    expect(GetBuildOutputForProject({ name: 'p', root: 'libs/p', targets: { build: {} } })).toBe('dist/libs/p');
  });

  it('resolves output placeholders', () => {
    const build = (outputs: string[], options: any = {}) =>
      GetBuildOutputForProject({ name: 'p', root: 'libs/p', targets: { build: { outputs, options } } });
    expect(build(['{workspaceRoot}/dist/p'])).toBe('dist/p');
    expect(build(['{projectRoot}/out'])).toBe('libs/p/out');
    expect(build(['{options.outputPath}'], { outputPath: 'dist/x' })).toBe('dist/x');
  });

  it('rejects invalid outputs', () => {
    expect(() => GetBuildOutputForProject({ name: 'p', root: 'r', targets: { build: { outputs: ['{workspaceRoot}'] } } })).toThrow('invalid build output');
    expect(() => GetBuildOutputForProject({ name: 'p', root: 'r', targets: { build: { outputs: ['{workspaceRoot}//abs'] } } })).toThrow('absolute build output');
  });
});

describe('GetRootDockerOptions', () => {
  const treeWith = (nx: object, pkg: object) => {
    const tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'nx.json', nx);
    writeJson(tree, 'package.json', pkg);
    return tree;
  };

  it('prefers configured docker options', () => {
    const tree = treeWith({ targetDefaults: { '@rxap/plugin-docker:build': { options: { imageName: 'img', imageRegistry: 'reg' } } } }, { name: 'pkg' });
    expect(GetRootDockerOptions(tree)).toEqual({ imageName: 'img', imageRegistry: 'reg' });
    const generic = treeWith({ targetDefaults: { docker: { options: { imageName: 'x' } } } }, { name: 'pkg' });
    expect(GetRootDockerOptions(generic)).toEqual({ imageName: 'x' });
  });

  it('derives the image name from the gitlab url or package name', () => {
    expect(GetRootDockerOptions(treeWith({}, { name: 'pkg', repository: { url: 'https://gitlab.com/group/repo.git' } })).imageName).toBe('group/repo');
    expect(GetRootDockerOptions(treeWith({}, { name: 'pkg', repository: { url: 'https://gitlab.com/x' } })).imageName).toBe('pkg');
    expect(GetRootDockerOptions(treeWith({}, { name: 'pkg', repository: { url: 'https://github.com/a/b.git' } })).imageName).toBe('pkg');
    expect(GetRootDockerOptions(treeWith({}, { name: 'pkg' })).imageName).toBe('pkg');
  });
});

describe('ForeachInitProject', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'a', { root: 'libs/a', tags: ['x'], targets: { build: { options: { v: 1 } } } });
    addProjectConfiguration(tree, 'b', { root: 'libs/b' });
  });

  it('yields projects and persists changes', () => {
    const names: string[] = [];
    for (const [name, project] of ForeachInitProject(tree, {}, () => false)) {
      names.push(name as string);
      if (name === 'a') {
        (project as any).targets.build.options.v = 2;
        (project as any).tags.push('y');
      }
    }
    expect(names.sort()).toEqual(['a', 'b']);
    expect(getProjects(tree).get('a')!.targets!['build'].options.v).toBe(2);
    expect(getProjects(tree).get('a')!.tags).toEqual(['x', 'y']);
  });

  it('persists property deletions and ignores unchanged writes', () => {
    for (const [name, project] of ForeachInitProject(tree, {}, () => false)) {
      if (name === 'a') {
        (project as any).tags = ['x'];
        delete (project as any).targets.build;
        delete (project as any).nothing;
      }
    }
    expect(getProjects(tree).get('a')!.targets).toEqual({});
  });

  it('skips projects and respects skipProjects', () => {
    const skip = jest.fn((_t, _o, _p, name: string) => name === 'a');
    expect([...ForeachInitProject(tree, {}, skip)].map(([n]) => n)).toEqual(['b']);
    expect([...ForeachInitProject(tree, { skipProjects: true }, skip)]).toEqual([]);
  });
});

describe('ng-package-json', () => {
  let tree: Tree;
  const project = { name: 'p', root: 'libs/p' };
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeJson(tree, 'libs/p/project.json', { name: 'p', root: 'libs/p' });
  });

  it('reads, writes and detects ng-package.json', () => {
    expect(HasNgPackageJson(tree, project)).toBe(false);
    expect(isNgPackagrProject(tree, project)).toBe(false);
    expect(() => ReadNgPackageJson(tree, project)).toThrow('has no ng-package.json');
    WriteNgPackageJson(tree, project, { dist: 'x' });
    expect(HasNgPackageJson(tree, 'libs/p')).toBe(true);
    expect(ReadNgPackageJson(tree, project)).toEqual({ dist: 'x' });
  });

  it('updates via project, root or name', () => {
    WriteNgPackageJson(tree, project, { dist: 'x' });
    UpdateNgPackageJson(tree, (j) => { j.dist = 'a'; }, { projectRoot: 'libs/p' });
    expect(ReadNgPackageJson(tree, project).dist).toBe('a');
    UpdateNgPackageJson(tree, (j) => { j.dist = 'b'; }, { project });
    expect(ReadNgPackageJson(tree, project).dist).toBe('b');
    UpdateNgPackageJson(tree, (j) => { j.dist = 'c'; }, { projectName: 'p' });
    expect(ReadNgPackageJson(tree, project).dist).toBe('c');
    expect(() => UpdateNgPackageJson(tree, () => undefined, {})).toThrow('Either the project or the projectName');
  });
});
