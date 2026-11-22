import { callRule, HostTree, SchematicContext } from '@angular-devkit/schematics';
import { firstValueFrom } from 'rxjs';
import {
  Angular,
  AngularProject,
  AngularProjectMap,
  AngularProjectTarget,
  AngularProjectTargetConfigurationsMap,
  AngularProjectTargetMap,
  GetAngularJson,
  GetAngularJsonFragments,
  IsAngularJson,
  IsFragmentedAngularJson,
  UpdateAngularJson,
  UpdateAngularProject,
} from './angular-json-file';
import { clone } from './clone';
import { equals } from './equals';
import {
  CoerceEnvFile,
  GetEnvFile,
  MergeWithEnvFile,
  WriteEnvFile,
} from './env-file';
import {
  applyContextToFunctionOrConstant,
  getIdentifierProperties,
  getIdentifierPropertyValue,
  hasIdentifierProperty,
  isObject,
  IsMaterialIcon,
  IsSvgIcon,
  ToControlOptions,
} from './helpers';

const context = {} as SchematicContext;
async function run(rule: any, tree: HostTree) {
  return firstValueFrom(callRule(rule, tree, context) as any);
}

describe('clone', () => {
  it('deep clones objects and arrays', () => {
    const src: any = { a: { b: [ 1, { c: 2 } ] } };
    const copy = clone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
    expect(copy.a.b[1]).not.toBe(src.a.b[1]);
  });
  it('supports shallow clone', () => {
    const src = { a: { b: 1 } };
    const copy = clone(src, [], [], false);
    expect(copy.a).toBe(src.a);
  });
  it('clones dates, regexps and typed arrays', () => {
    const d = new Date(5);
    expect(clone(d)).toEqual(d);
    expect(clone(d)).not.toBe(d);
    const r = /ab+/gimuy;
    const rc = clone(r);
    expect(rc.source).toBe('ab+');
    expect(rc.flags).toContain('g');
    expect(rc.flags).toContain('i');
    expect(rc.flags).toContain('m');
    expect(rc.flags).toContain('y');
    expect(rc.flags).toContain('u');
    const t = new Uint8Array([ 1, 2 ]);
    const tc = clone(t);
    expect(tc).toEqual(t);
    expect(tc).not.toBe(t);
  });
  it('returns primitives, null and undefined as is', () => {
    expect(clone(1)).toBe(1);
    expect(clone('s')).toBe('s');
    expect(clone(null)).toBeNull();
    expect(clone(undefined)).toBeUndefined();
  });
  it('handles circular references', () => {
    const a: any = { name: 'a' };
    a.self = a;
    const c = clone(a);
    expect(c.self).toBe(c);
    expect(c).not.toBe(a);
  });
  it('preserves prototype', () => {
    class P { x = 1; }
    expect(clone(new P())).toBeInstanceOf(P);
  });
});

describe('equals', () => {
  it('compares primitives', () => {
    expect(equals(1, 1)).toBe(true);
    expect(equals(1, 2)).toBe(false);
    expect(equals(NaN, NaN)).toBe(true);
    expect(equals(0, -0)).toBe(false);
    expect(equals(1, '1')).toBe(false);
    expect(equals(new Number(1), new Number(1))).toBe(true);
    expect(equals(new String('a'), new String('b'))).toBe(false);
    expect(equals(new Boolean(true), new Boolean(true))).toBe(true);
  });
  it('compares objects and arrays deeply', () => {
    expect(equals({ a: [ 1, { b: 2 } ] }, { a: [ 1, { b: 2 } ] })).toBe(true);
    expect(equals({ a: 1 }, { a: 2 })).toBe(false);
    expect(equals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(equals({ a: 1 }, { b: 1 })).toBe(false);
    expect(equals([ 1, 2 ], [ 1, 2, 3 ])).toBe(false);
    expect(equals([], {})).toBe(false);
  });
  it('compares dates, regexps and errors', () => {
    expect(equals(new Date(1), new Date(1))).toBe(true);
    expect(equals(new Date(1), new Date(2))).toBe(false);
    expect(equals(/a/g, /a/g)).toBe(true);
    expect(equals(/a/g, /a/i)).toBe(false);
    expect(equals(new Error('x'), new Error('x'))).toBe(true);
    expect(equals(new Error('x'), new Error('y'))).toBe(false);
  });
  it('compares maps and sets order independent', () => {
    expect(equals(new Map([ [ 1, 'a' ], [ 2, 'b' ] ]), new Map([ [ 2, 'b' ], [ 1, 'a' ] ]))).toBe(true);
    expect(equals(new Map([ [ 1, 'a' ] ]), new Map([ [ 1, 'b' ] ]))).toBe(false);
    expect(equals(new Map([ [ 1, 'a' ] ]), new Map())).toBe(false);
    expect(equals(new Set([ 1, 2 ]), new Set([ 2, 1 ]))).toBe(true);
    expect(equals(new Set([ 1 ]), new Set([ 2 ]))).toBe(false);
    expect(equals(new Set([ 1 ]), new Set([ 1, 2 ]))).toBe(false);
  });
  it('compares typed arrays', () => {
    expect(equals(new Uint8Array([ 1, 2 ]), new Uint8Array([ 1, 2 ]))).toBe(true);
    expect(equals(new Uint8Array([ 1, 2 ]), new Uint8Array([ 1, 3 ]))).toBe(false);
  });
  it('handles circular references', () => {
    const a: any = { x: 1 }; a.self = a;
    const b: any = { x: 1 }; b.self = b;
    expect(equals(a, b)).toBe(true);
  });
  it('uses custom equals methods', () => {
    const a = { equals: (o: any) => o.v === 1, v: 1 };
    const b = { equals: (o: any) => o.v === 1, v: 1 };
    expect(equals(a, b)).toBe(true);
    expect(equals({ equals: () => true }, { v: 1 })).toBe(false);
    const fl = { 'fantasy-land/equals': () => true };
    expect(equals(fl, { 'fantasy-land/equals': () => true })).toBe(true);
    expect(equals(fl, {})).toBe(false);
  });
  it('treats promises and functions by identity', () => {
    const p = Promise.resolve(1);
    expect(equals(p, p)).toBe(true);
    expect(equals(Promise.resolve(1), Promise.resolve(1))).toBe(false);
    expect(equals(() => 1, () => 1)).toBe(false);
  });
});

describe('helpers', () => {
  it('isObject', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject('s')).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(() => 1)).toBe(false);
    expect(isObject(Symbol('s'))).toBe(false);
    expect(isObject(BigInt(1))).toBe(false);
    expect(isObject(true)).toBe(false);
  });
  it('applyContextToFunctionOrConstant', () => {
    expect(applyContextToFunctionOrConstant(5)).toBe(5);
    expect(applyContextToFunctionOrConstant((a: number, b: number) => a + b, [ 1, 2 ])).toBe(3);
    expect(applyContextToFunctionOrConstant(() => 7)).toBe(7);
    expect(applyContextToFunctionOrConstant(undefined)).toBeNull();
    expect(applyContextToFunctionOrConstant(undefined, undefined, 9)).toBe(9);
  });
  it('identifier helpers', () => {
    expect(hasIdentifierProperty({ id: 1 })).toBe(true);
    expect(hasIdentifierProperty({ name: 'x' })).toBe(false);
    expect(getIdentifierProperties({ id: 1, uuid: 2, name: 'x' })).toEqual([ 'id', 'uuid' ]);
    expect(getIdentifierPropertyValue({ uuid: 'u' })).toBe('u');
    expect(getIdentifierPropertyValue({ key: 'k' })).toBe('k');
    expect(getIdentifierPropertyValue({})).toBeNull();
  });
  it('icons and control options', () => {
    expect(IsSvgIcon({ svgIcon: 'a' })).toBe(true);
    expect(IsSvgIcon({ icon: 'a' })).toBe(false);
    expect(IsSvgIcon(undefined)).toBe(false);
    expect(IsMaterialIcon({ icon: 'a' })).toBe(true);
    expect(IsMaterialIcon({ svgIcon: 'a' })).toBe(false);
    expect(ToControlOptions([ 'a', 'b' ])).toEqual([ { value: 'a', display: 'a' }, { value: 'b', display: 'b' } ]);
  });
});

describe('env file tree operations', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  it('writes, reads, coerces and merges', async () => {
    const tree = new HostTree();
    expect(() => GetEnvFile(tree)).toThrow('Could not find a env file');
    WriteEnvFile(tree, { A: 'a', B: 2 });
    expect(GetEnvFile(tree)).toEqual({ A: 'a', B: 2 });
    CoerceEnvFile(tree, { C: true });
    expect(GetEnvFile(tree)).toEqual({ C: true });
    await run(MergeWithEnvFile({ D: 'd' }), tree);
    expect(GetEnvFile(tree)).toEqual({ C: true, D: 'd' });
    await run(MergeWithEnvFile({ E: 'e' }, '.env.other'), tree);
    expect(GetEnvFile(tree, '.env.other')).toEqual({ E: 'e' });
  });
});

describe('angular.json model', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => undefined));
  afterEach(() => jest.restoreAllMocks());

  const json = () => ({
    version: 1,
    defaultProject: 'app',
    projects: {
      app: {
        root: 'apps/app',
        sourceRoot: 'apps/app/src',
        projectType: 'application',
        prefix: 'x',
        architect: { build: { builder: 'b', options: { o: 1 }, configurations: { prod: {} } } },
      },
    },
  });

  it('detects fragmented and flat json', () => {
    expect(IsAngularJson(json() as any)).toBe(true);
    expect(IsAngularJson({ version: 2, projects: { a: 'path' } } as any)).toBe(false);
    expect(IsFragmentedAngularJson({ version: 2 } as any)).toBe(true);
    expect(IsFragmentedAngularJson({ version: 1 } as any)).toBe(false);
  });

  it('resolves fragments from project.json files', () => {
    const tree = new HostTree();
    tree.create('apps/app/project.json', JSON.stringify({ root: 'apps/app' }));
    const original = { version: 2, projects: { app: 'apps/app' } };
    const merged = GetAngularJsonFragments(tree, original);
    expect(merged.projects!['app']).toEqual({ root: 'apps/app' });
    expect(original.projects.app).toBe('apps/app');
    expect(GetAngularJsonFragments(tree, { version: 2 }).projects as any).toEqual({});
  });

  it('GetAngularJson prefers workspace.json, falls back to angular.json', () => {
    const tree = new HostTree();
    expect(() => GetAngularJson(tree)).toThrow('Could not find angular.json or workspace.json');
    tree.create('angular.json', JSON.stringify(json()));
    expect(GetAngularJson(tree).projects!['app'].root).toBe('apps/app');
    expect(console.warn).toHaveBeenCalled();
    tree.create('workspace.json', JSON.stringify({ version: 1, projects: { w: { root: 'w' } } }));
    expect(Object.keys(GetAngularJson(tree).projects as any)).toEqual([ 'w' ]);
  });

  it('GetAngularJson resolves a fragmented workspace.json', () => {
    const tree = new HostTree();
    tree.create('workspace.json', JSON.stringify({ version: 2, projects: { p: 'libs/p' } }));
    tree.create('libs/p/project.json', JSON.stringify({ root: 'libs/p' }));
    expect(GetAngularJson(tree).projects!['p'].root).toBe('libs/p');
  });

  it('Angular wraps projects and targets', () => {
    const angular = new Angular(json() as any);
    expect(angular.defaultProject?.name).toBe('app');
    expect(angular.cli).toEqual({});
    expect(angular.schematics).toEqual({});
    const project = angular.projects.get('app')!;
    expect(project.prefix).toBe('x');
    expect(project.root).toBe('apps/app');
    expect(project.sourceRoot).toBe('apps/app/src');
    expect(project.projectType).toBe('application');
    expect(project.cli).toEqual({});
    expect(project.schematics).toEqual({});
    expect(project.i18n).toEqual({});
    const build = project.targets.get('build')!;
    expect(build.builder).toBe('b');
    build.builder = 'c';
    build.options = { o: 2 };
    build.configurations = { dev: {} };
    expect(build.builder).toBe('c');
    expect(build.options).toEqual({ o: 2 });
    expect(build.configurations).toEqual({ dev: {} });
  });

  it('Angular without projects or default project', () => {
    const angular = new Angular({ version: 1 } as any);
    expect(angular.projects.keys().next().done).toBe(true);
    expect(angular.defaultProject).toBeUndefined();
  });

  it('AngularProjectMap add / has / delete keep the underlying json in sync', () => {
    const raw: any = {};
    const map = new AngularProjectMap(raw);
    map.add('a', { root: 'a' } as any);
    expect(map.has('a')).toBe(true);
    expect(raw.a.root).toBe('a');
    expect(() => map.add('a', {} as any)).toThrow('already exists');
    expect(Array.from(map.keys())).toEqual([ 'a' ]);
    expect(Array.from(map.values())).toHaveLength(1);
    expect(Array.from(map.entries())[0][0]).toBe('a');
    expect(map.delete('a')).toBe(true);
    expect(raw.a).toBeUndefined();
    expect(map.delete('a')).toBe(false);
  });

  it('AngularProjectTargetMap add / has / delete', () => {
    const raw: any = {};
    const map = new AngularProjectTargetMap(raw);
    map.add('t', { builder: 'x' } as any);
    expect(map.has('t')).toBe(true);
    expect(raw.t.builder).toBe('x');
    expect(() => map.add('t', {} as any)).toThrow('already exists');
    expect(Array.from(map.keys())).toEqual([ 't' ]);
    expect(Array.from(map.values())[0]).toBeInstanceOf(AngularProjectTarget);
    expect(Array.from(map.entries())).toHaveLength(1);
    expect(map.delete('t')).toBe(true);
    expect(map.delete('t')).toBe(false);
    expect(raw.t).toBeUndefined();
  });

  it('AngularProjectTargetConfigurationsMap add / get / delete', () => {
    const raw: any = { a: { x: 1 } };
    const map = new AngularProjectTargetConfigurationsMap(raw);
    expect(map.get('a')).toEqual({ x: 1 });
    map.add('b', { y: 2 });
    expect(raw.b).toEqual({ y: 2 });
    expect(() => map.add('b', {})).toThrow('already exists');
    expect(map.has('b')).toBe(true);
    expect(map.delete('b')).toBe(true);
    expect(map.delete('b')).toBe(false);
    expect(raw.b).toBeUndefined();
  });

  it('AngularProject uses targets when architect is missing', () => {
    const project = new AngularProject({ root: 'r' } as any, 'n');
    expect(project.targets.has('x')).toBe(false);
    expect((project._project as any).targets).toEqual({});
  });

  it('UpdateAngularJson / UpdateAngularProject rules', async () => {
    const tree = new HostTree();
    tree.create('angular.json', JSON.stringify(json()));
    await run(UpdateAngularJson(angular => { angular.projects.get('app')!.targets.delete('build'); }), tree);
    expect(JSON.parse(tree.readText('angular.json')).projects.app.architect).toEqual({});
    await run(UpdateAngularProject(p => { p.targets.add('serve', { builder: 's' } as any); }, { projectName: 'app' }), tree);
    expect(JSON.parse(tree.readText('angular.json')).projects.app.architect.serve.builder).toBe('s');
    await expect(run(UpdateAngularProject(() => undefined, { projectName: 'nope' }), tree)).rejects.toThrow();
    await expect(run(UpdateAngularJson(() => { throw new Error('boom'); }), tree)).rejects.toThrow('Could not update the angular.json: boom');
  });
});
