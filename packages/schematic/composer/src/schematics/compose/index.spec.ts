import {
  callRule,
  HostTree,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import compose from './index';

const external = jest.fn();

jest.mock('@angular-devkit/schematics', () => {
  const actual = jest.requireActual('@angular-devkit/schematics');
  return {
    ...actual,
    externalSchematic: (...args: any[]) => {
      external(...args);
      return () => undefined;
    },
  };
});

function write(tree: Tree, path: string, content: unknown) {
  tree.create(path, typeof content === 'string' ? content : JSON.stringify(content));
}

describe('compose schematic', () => {
  let tree: Tree;
  let context: SchematicContext;
  let addTask: jest.Mock;

  beforeEach(() => {
    external.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    addTask = jest.fn();
    context = { addTask, logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn() } } as any;
    tree = new HostTree();
    write(tree, 'package.json', { name: 'root', dependencies: {}, devDependencies: {} });
  });
  afterEach(() => jest.restoreAllMocks());

  async function run(options: any, rule: Rule = compose(options)): Promise<Tree> {
    const result = callRule(rule, tree, context);
    return isObservable(result) ? firstValueFrom(result as Observable<Tree>) : (result as any);
  }

  function addLibrary(name: string, root: string, extra: object = {}) {
    write(tree, `${ root }/project.json`, {
      name, projectType: 'library', root, sourceRoot: `${ root }/src`, ...extra,
    });
  }

  it('runs commands of a project and adds the composer as dev dependency', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/thing/schematics.json', [
      { package: '@rxap/schematic-angular', name: 'component', options: { name: 'x' } },
    ]);
    await run({ project: 'my-lib' });
    expect(external).toHaveBeenCalledWith('@rxap/schematic-angular', 'component', expect.objectContaining({
      name: 'x', project: 'my-lib', overwrite: false,
    }));
    const pkg = JSON.parse(tree.read('package.json')!.toString());
    expect(pkg.devDependencies['@rxap/schematic-composer']).toBeDefined();
    expect(addTask).toHaveBeenCalledTimes(1);
  });

  it('parses yaml files and a single command', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/b/schematic.yaml', 'package: "@rxap/schematic-x"\nname: gen\n');
    await run({ project: 'my-lib' });
    expect(external).toHaveBeenCalledWith('@rxap/schematic-x', 'gen', expect.objectContaining({ project: 'my-lib', directory: 'a' }));
  });

  it('filters by folder name', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [{ package: '@rxap/schematic-a', name: 'a' }]);
    write(tree, 'libs/my-lib/src/lib/b/schematics.json', [{ package: '@rxap/schematic-b', name: 'b' }]);
    await run({ project: 'my-lib', filter: 'b' });
    expect(external).toHaveBeenCalledTimes(1);
    expect(external.mock.calls[0][0]).toBe('@rxap/schematic-b');
  });

  it('filters by file name', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [{ package: '@rxap/schematic-a', name: 'a' }]);
    write(tree, 'libs/my-lib/src/lib/b/schematics.yaml', 'package: "@rxap/schematic-b"\nname: b\n');
    await run({ project: 'my-lib', file: 'schematics.yaml' });
    expect(external).toHaveBeenCalledTimes(1);
    expect(external.mock.calls[0][0]).toBe('@rxap/schematic-b');
  });

  it('logs when no command files are found', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    await run({ project: 'my-lib' });
    expect(external).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No schematic command files'), expect.anything());
  });

  it('rejects invalid command files', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [{ name: 'x' }]);
    await expect(run({ project: 'my-lib' })).rejects.toThrow('The package name is required');
  });

  it('rejects a command without a name', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [{ package: 'p' }]);
    await expect(run({ project: 'my-lib' })).rejects.toThrow('The name is required');
  });

  it('rejects non object options', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [{ package: 'p', name: 'n', options: 'x' }]);
    await expect(run({ project: 'my-lib' })).rejects.toThrow('The options must be an object');
  });

  it('rejects empty command files', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', '');
    await expect(run({ project: 'my-lib' })).rejects.toThrow('does not exists');
  });

  it('uses feature directories and detects the project from the file path', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/feature/user/index.ts', '');
    write(tree, 'libs/my-lib/src/feature/user/sub/schematics.json', [
      { package: '@rxap/schematic-angular', name: 'x', options: { project: undefined } },
    ]);
    await run({ project: 'my-lib', feature: 'User' });
    expect(external).toHaveBeenCalledWith('@rxap/schematic-angular', 'x', expect.objectContaining({
      project: 'my-lib', feature: 'user',
    }));
  });

  it('fails for an unknown feature', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    await expect(run({ project: 'my-lib', feature: 'nope' })).rejects.toThrow("The feature 'nope' does not exists");
  });

  it('detects the feature from the path and the project from project.json', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/feature/user/index.ts', '');
    write(tree, 'libs/my-lib/feature/auth/gen/schematics.json', [{ package: '@rxap/schematic-angular', name: 'x' }]);
    await run({ file: 'libs/my-lib/feature/auth/gen/schematics.json' });
    expect(external).toHaveBeenCalledWith('@rxap/schematic-angular', 'x', expect.objectContaining({
      project: 'my-lib', feature: 'auth',
    }));
  });

  it('uses overwrite lists only for schematic packages', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [
      { package: '@rxap/schematic-a', name: 'a' },
      { package: 'other', name: 'b' },
    ]);
    await run({ project: 'my-lib', overwrite: 'x,y' });
    expect(external.mock.calls[0][2].overwrite).toEqual(['x', 'y']);
    expect(external.mock.calls[1][2].overwrite).toBe(true);
  });

  it('runs for a file in the workspace', async () => {
    addLibrary('my-lib', 'libs/my-lib');
    write(tree, 'libs/my-lib/src/lib/a/schematics.json', [{ package: '@rxap/schematic-a', name: 'a' }]);
    await run({ file: 'libs/my-lib/src/lib/a/schematics.json' });
    expect(external).toHaveBeenCalledTimes(1);
  });

  it('runs for the workspace and a directory', async () => {
    write(tree, 'tools/gen/schematics.json', [{ package: '@rxap/schematic-a', name: 'a' }]);
    await run({});
    expect(external).toHaveBeenCalledTimes(1);
    external.mockClear();
    await run({ directory: 'tools' });
    expect(external).toHaveBeenCalledTimes(1);
  });

  it('skips package installation when the dependencies did not change', async () => {
    write(tree, 'tools/gen/schematics.json', [{ package: '@rxap/schematic-a', name: 'a' }]);
    tree.overwrite('package.json', JSON.stringify({
      name: 'root', devDependencies: { '@rxap/schematic-composer': 'latest' },
    }));
    await run({});
    expect(addTask).not.toHaveBeenCalled();
  });

  it('runs when no sourceRoot project exists and for application projects', async () => {
    write(tree, 'apps/app/project.json', { name: 'app', projectType: 'application', root: 'apps/app' });
    write(tree, 'apps/app/gen/schematics.json', [{ package: '@rxap/schematic-a', name: 'a' }]);
    await run({ project: 'app' });
    expect(external).toHaveBeenCalledTimes(1);
  });
});
