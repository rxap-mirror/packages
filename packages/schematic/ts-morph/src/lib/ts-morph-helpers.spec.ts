import { HostTree, Tree } from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { Project, SyntaxKind } from 'ts-morph';
import { AddFakeProvider } from './add-fake-provider';
import { AddMethodClass, CoerceMethodClassLegacy } from './add-method-class';
import { AddProviderToArray } from './add-provider-to-array';
import { AutoImport } from './auto-import';
import { FixMissingImports } from './fix-missing-imports';
import { OrganizeImports } from './organize-imports';
import { CoerceClassProperty } from './ts-morph/coerce-class-property';
import { CoerceFunction } from './ts-morph/coerce-function';
import { CoerceInterface, CoerceInterfaceRule } from './ts-morph/coerce-interface';
import { CoerceParameterDeclaration } from './ts-morph/coerce-parameter-declaration';
import { CoerceStatements } from './ts-morph/coerce-statements';
import { CoerceTypeAlias } from './ts-morph/coerce-type-alias';
import { FindByNameFunction } from './ts-morph/find-function';
import { IsWriteTypeOptions, WriteStringType, WriteType } from './ts-morph/write-type';
import { ApplyTsMorphProjectRule } from './ts-morph/apply-ts-morph-project';
import { TsMorphTransformRule, TsMorphNestProjectTransformRule, TsMorphAngularProjectTransformRule } from './ts-morph-transform';

describe('ts-morph helpers', () => {
  let project: Project;
  beforeEach(() => (project = CreateProject()));
  const file = (t = '') => project.createSourceFile('t.ts', t);

  describe('AddProviderToArray', () => {
    const arr = (t = '[]') => file(`const a = ${ t };`).getVariableDeclarationOrThrow('a').getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    it('adds strings and avoids duplicates', () => {
      const a = arr();
      AddProviderToArray('A', a);
      AddProviderToArray('A', a);
      AddProviderToArray('provideX(1)', a);
      AddProviderToArray('provideX(2)', a);
      expect(a.getElements().map(e => e.getText())).toEqual([ 'A', 'provideX(1)' ]);
      AddProviderToArray('provideX(2)', a, true);
      expect(a.getElements().map(e => e.getText())).toEqual([ 'A', 'provideX(2)' ]);
    });
    it('adds provider objects', () => {
      const a = arr();
      AddProviderToArray({ provide: 'TOKEN', useClass: 'Impl', deps: [ 'A', 'B' ], multi: true }, a);
      AddProviderToArray({ provide: 'TOKEN', useValue: '1', multi: false }, a);
      expect(a.getElements()).toHaveLength(1);
      const text = a.getText().replace(/\s+/g, ' ');
      expect(text).toContain('provide: TOKEN');
      expect(text).toContain('useClass: Impl');
      expect(text).toContain('deps: [ A,B ]');
      expect(text).toContain('multi: true');
      AddProviderToArray({ provide: 'TOKEN', useValue: '1', multi: false, deps: w => w.write('[]') }, a, [ 'provider' ]);
      expect(a.getElements()).toHaveLength(1);
      expect(a.getText()).toContain('useValue: 1');
      expect(a.getText()).toContain('multi: false');
    });
  });

  it('AddFakeProvider', () => {
    const sf = file('export class C {}');
    AddFakeProvider(sf, { provide: 'T', useValue: '1' }, 'RealProvider', 'my-fake');
    const text = sf.getText();
    expect(text).toContain(`IsFaked('my-fake') ? FAKE_PROVIDERS : REAL_PROVIDERS`);
    expect(text).toContain('RealProvider');
    expect(text).toContain(`from '@rxap/fake'`);
    AddFakeProvider(sf, undefined, undefined, 'my-fake');
    expect(sf.getText().match(/FAKE_PROVIDER_FACTORY/g)).toHaveLength(1);
  });

  it('AddMethodClass / CoerceMethodClassLegacy', () => {
    const sf = file();
    AddMethodClass(sf, 'Do', { returnType: 'string', parameterType: 'number', isAsync: true, implements: [ 'X' ], structures: [ { moduleSpecifier: './x', namedImports: [ 'X' ] } ] });
    const text = sf.getText();
    expect(text).toContain('class DoMethod implements Method<string, number>, X');
    expect(text).toContain('@Injectable()');
    expect(text).toContain('async call(parameters: number): Promise<string>');
    expect(text).toContain(`from '@rxap/rxjs'`);
    CoerceMethodClassLegacy(sf, 'Do');
    expect(sf.getClasses()).toHaveLength(1);
    CoerceMethodClassLegacy(sf, 'Other', { decorators: [ { name: 'Injectable', arguments: [] } ] });
    expect(sf.getClasses()).toHaveLength(2);
  });

  describe('ts-morph folder', () => {
    it('coerce helpers', () => {
      const sf = file('class A {}');
      const cls = sf.getClassOrThrow('A');
      const p = CoerceClassProperty(cls, 'p', { type: 'string' });
      expect(CoerceClassProperty(cls, 'p', { type: 'number' })).toBe(p);
      expect(p.getTypeNode()?.getText()).toBe('string');
      const fn = CoerceFunction(sf, 'f', { returnType: 'void', isExported: true });
      expect(CoerceFunction(sf, 'f').getReturnTypeNode()?.getText()).toBe('void');
      expect(fn.isExported()).toBe(true);
      const prm = CoerceParameterDeclaration(fn, 'x', { type: 'string' });
      expect(CoerceParameterDeclaration(fn, 'x')).toBe(prm);
      CoerceParameterDeclaration(fn, 'y');
      CoerceStatements(fn, 'return;');
      CoerceStatements(fn, 'other();');
      expect(fn.getStatements()).toHaveLength(1);
      const t = CoerceTypeAlias(sf, 'T');
      expect(t.getTypeNode()?.getText()).toBe('unknown');
      expect(CoerceTypeAlias(sf, 'T', { type: 'string' })).toBe(t);
      expect(CoerceTypeAlias(sf, 'U', { type: 'string' }).getTypeNode()?.getText()).toBe('string');
      const i = CoerceInterface(sf, 'I', { isExported: true });
      expect(CoerceInterface(sf, 'I')).toBe(i);
      expect(FindByNameFunction({ name: 'p' })(p)).toBe(true);
    });

    it('CoerceInterfaceRule delegates to the transform rule', () => {
      const tsMorphTransform = jest.fn();
      const transformRule = jest.fn((opts, cb, files) => {
        const sf = file();
        cb(project, [ sf ]);
        return { opts, files, sf };
      });
      const result: any = CoerceInterfaceRule({
        name: 'my-thing', project: 'p', propertyList: [ { name: 'a', type: { name: 'string' }, isArray: false, isOptional: false, source: null, memberList: [] } as any ], tsMorphTransform,
      } as any, transformRule as any);
      expect(result.files).toEqual([ 'my-thing.ts?' ]);
      expect(result.sf.getText()).toContain('interface MyThing');
      expect(result.sf.getText()).toContain('a: string');
      expect(tsMorphTransform).toHaveBeenCalled();
    });

    it('WriteType', () => {
      const sf = file();
      const w = (t: any) => {
        const out = project.createSourceFile('w' + Math.random() + '.ts', '');
        out.addTypeAlias({ name: 'X', type: WriteType(t, sf) });
        return out.getTypeAliasOrThrow('X').getTypeNode()?.getText();
      };
      expect(w('string')).toBe('string');
      expect(w('date')).toBe('Date');
      expect(w('uuid')).toBe('string');
      expect(w({ type: 'number', isArray: true })).toBe('Array<number>');
      expect(w((wr: any) => wr.write('Foo'))).toBe('Foo');
      expect(w({ name: 'Bar', moduleSpecifier: './bar' })).toBe('Bar');
      expect(sf.getText()).toContain(`import { Bar } from './bar';`);
      expect(() => w({ name: undefined })).toThrow();
      expect(IsWriteTypeOptions('a')).toBeFalsy();
      expect(IsWriteTypeOptions({ type: 'a' })).toBeTruthy();
      let written = '';
      WriteStringType('date', { write: (s: string) => (written += s) } as any);
      expect(written).toBe('Date');
    });
  });

  describe('rules', () => {
    const run = async (rule: any, tree: Tree) => rule(tree, {} as any);

    it('FixMissingImports (no basePath, and basePath)', async () => {
      jest.spyOn(console, 'debug').mockImplementation();
      const tree = new HostTree();
      tree.create('/a.ts', 'export class A {}');
      tree.create('/b.ts', 'export const b = 1;');
      await run(FixMissingImports(), tree);
      expect(tree.read('/a.ts')?.toString()).toContain('class A');
      const tree2 = new HostTree();
      tree2.create('/src/a.ts', 'export class A {}');
      tree2.create('/src/a.spec.ts', 'x');
      await run(FixMissingImports('/src'), tree2);
      expect(tree2.read('/src/a.ts')?.toString()).toContain('class A');
    });

    it('OrganizeImports', async () => {
      jest.spyOn(console, 'debug').mockImplementation();
      const tree = new HostTree();
      tree.create('/a.ts', `import { b } from './b';\nimport { a } from './a';\nexport const c = [a, b];`);
      tree.create('/a.json', '{}');
      await run(OrganizeImports(), tree);
      const out = tree.read('/a.ts')!.toString();
      expect(out.indexOf(`'./a'`)).toBeLessThan(out.indexOf(`'./b'`));
    });

    it('AutoImport', async () => {
      jest.spyOn(console, 'debug').mockImplementation();
      const tree = new HostTree();
      tree.create('/src/a.ts', 'export class A {}');
      tree.create('/src/b.ts', 'export const b = new A();');
      await run(AutoImport('/src'), tree);
      expect(tree.exists('/src/b.ts')).toBe(true);
    });

    it('rule wrappers return rules', () => {
      expect(typeof TsMorphTransformRule('/', () => null)).toBe('function');
      expect(typeof TsMorphNestProjectTransformRule({ project: 'p' } as any, () => null)).toBe('function');
      expect(typeof TsMorphAngularProjectTransformRule({ project: 'p' } as any, () => null)).toBe('function');
      expect(typeof ApplyTsMorphProjectRule(project)).toBe('function');
    });
  });
});
