import { CreateProject } from '@rxap/ts-morph';
import { Project, SyntaxKind } from 'ts-morph';
import { AddClassMethod } from './add-class-method';
import { AddDir } from './add-dir';
import { AddToArray } from './add-to-array';
import { AddVariableProvider } from './add-variable-provider';
import { AddVariableFakeProvider } from './add-variable-fake-provider';
import { CoerceClassConstructor } from './coerce-class-constructor';
import { CoerceClassMethod } from './coerce-class-method';
import { CoerceClass } from './coerce-class';
import { CoercePropertyKey } from './coerce-property-key';
import { CoerceSourceFile } from './coerce-source-file';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { GetVariableDeclaration } from './get-variable-declaration';
import { AddToFormProviders, GetFormProvidersFile } from './get-form-providers-source-file';
import { MergeTsMorphProject } from './merge-ts-morph-project';
import { OverwriteDecorator } from './overwrite-decorator';
import { OverwriteProperty } from './overwrite-property';
import { GetArrayDeclaration } from './get-array-declaration';
import { AssertArrayLiteralExpression, IsArrayLiteralExpression } from './is-array-literal-expression';
import { GetClassDecoratorArguments } from './get-class-decorator-arguments';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';

describe('misc helpers', () => {
  let project: Project;
  beforeEach(() => (project = CreateProject()));
  const file = (text = '') => project.createSourceFile('t.ts', text);

  it('AddClassMethod', () => {
    const cls = file('class A { m() {} }').getClassOrThrow('A');
    expect(() => AddClassMethod(cls, 'm', {})).toThrow('already exists');
    AddClassMethod(cls, 'm', { returnType: 'string', statements: 'return "";' }, true);
    AddClassMethod(cls, 'n', {});
    expect(cls.getMethodOrThrow('m').getReturnTypeNode()?.getText()).toBe('string');
    expect(cls.getMethod('n')).toBeDefined();
  });

  it('AddDir adds ts files recursively', () => {
    const files: Record<string, string> = { 'a.ts': 'const a = 1;', 'b.js': '', 'sub/c.ts': 'const c = 2;' };
    const mk = (prefix: string): any => ({
      subfiles: Object.keys(files).filter(f => !f.slice(prefix.length).includes('/') && f.startsWith(prefix)).map(f => f.slice(prefix.length)),
      subdirs: prefix === '' ? [ 'sub' ] : [],
      file: (p: string) => ({ content: Buffer.from(files[prefix + p]) }),
      dir: (p: string) => mk(p + '/'),
    });
    AddDir(mk(''), project, 'base');
    expect(project.getSourceFile('base/a.ts')).toBeDefined();
    expect(project.getSourceFile('base/sub/c.ts')?.getText()).toContain('const c');
    expect(project.getSourceFile('base/b.js')).toBeUndefined();
    const bad: any = { subfiles: [ 'x.ts' ], subdirs: [], file: () => null };
    expect(() => AddDir(bad, project)).toThrow('file entry');
    const badDir: any = { subfiles: [], subdirs: [ 'x' ], dir: () => null };
    expect(() => AddDir(badDir, project)).toThrow('dir entry');
  });

  it('AddToArray', () => {
    const sf = file();
    AddToArray(sf, 'ARR', 'a');
    AddToArray(sf, 'ARR', 'a');
    AddToArray(sf, 'ARR', 'b');
    expect(sf.getVariableDeclarationOrThrow('ARR').getInitializerOrThrow().getText().replace(/\s/g, '')).toBe('[a,b]');
    AddToArray(sf, 'ARR', 'a', 'any[]', true);
    expect(sf.getVariableDeclarationOrThrow('ARR').getInitializerOrThrow().getText().replace(/\s/g, '')).toBe('[b,a]');
    const sf2 = file2('const X: any = 5;');
    expect(() => AddToArray(sf2, 'X', 'a')).toThrow('array literal');
    function file2(t: string) { return project.createSourceFile('t2.ts', t); }
  });

  it('AddVariableProvider and fake provider', () => {
    const sf = file();
    AddVariableProvider(sf, 'PROVIDERS', 'MyService', [ { moduleSpecifier: './my', namedImports: [ 'MyService' ] } ]);
    expect(sf.getText()).toContain('Provider[]');
    expect(sf.getText()).toContain(`from './my'`);
    expect(sf.getText()).toContain('MyService');
    const sf2 = project.createSourceFile('t2.ts', 'export const P = 5;');
    expect(() => AddVariableProvider(sf2, 'P', 'X')).toThrow('array literal');
    const sf3 = project.createSourceFile('t3.ts', '');
    AddVariableFakeProvider(sf3, 'FP', { provide: 'FAKE', useValue: '1' }, { provide: 'REAL', useValue: '2' }, 'fakeFn');
    expect(sf3.getText()).toContain('FAKE_PROVIDER_FACTORY');
  });

  it('deprecated coerce helpers', () => {
    const sf = file();
    const cls = CoerceClass(sf, 'A', { isExported: true });
    expect(CoerceClass(sf, 'A')).toBe(cls);
    expect(CoerceClassConstructor(cls)).toHaveLength(1);
    expect(CoerceClassConstructor(cls)).toHaveLength(1);
    const m = CoerceClassMethod(cls, 'run', { returnType: 'void' });
    expect(CoerceClassMethod(cls, 'run')).toBe(m);
    expect(CoerceSourceFile(project, 't.ts')).toBe(sf);
    expect(CoerceSourceFile(project, 'new.ts', 'const x = 1;').getText()).toContain('const x');
    const v = CoerceVariableDeclaration(sf, 'v', { initializer: '1' });
    expect(CoerceVariableDeclaration(sf, 'v')).toBe(v);
    expect(sf.getVariableStatementOrThrow('v').isExported()).toBe(true);
    expect(GetVariableDeclaration(sf, 'v')?.getName()).toBe('v');
    expect(GetVariableDeclaration(sf, 'nope')).toBeNull();
  });

  it('CoercePropertyKey', () => {
    expect(CoercePropertyKey('abc')).toBe('abc');
    expect(CoercePropertyKey('a-b')).toBe(`'a-b'`);
    expect(CoercePropertyKey('1a')).toBe(`'1a'`);
    expect(CoercePropertyKey('a-b', true)).toBe('ab');
    expect(CoercePropertyKey('[key: string]')).toBe('[key: string]');
  });

  it('form providers file', () => {
    expect(GetFormProvidersFile(project)).toBe(GetFormProvidersFile(project));
    const sf = AddToFormProviders(project, 'FooProvider');
    expect(sf.getText()).toContain('FormProviders');
    expect(sf.getText()).toContain('FooProvider');
  });

  it('MergeTsMorphProject', () => {
    const src = CreateProject();
    src.createSourceFile('/a.ts', 'const a = 1;');
    MergeTsMorphProject(project, src, 'rel');
    expect(project.getSourceFile('/rel/a.ts')?.getText()).toBe('const a = 1;');
  });

  it('OverwriteDecorator / OverwriteProperty', () => {
    const sf = file(`class A { @Input() x: string; }`);
    const prop = sf.getClassOrThrow('A').getPropertyOrThrow('x');
    OverwriteDecorator(prop, { name: 'Input', arguments: [ `'alias'` ] });
    expect(prop.getDecorators()).toHaveLength(1);
    expect(prop.getDecorator('Input')?.getText()).toBe(`@Input('alias')`);
    const sf2 = project.createSourceFile('o.ts', 'const o = { a: 1, b: 2 };');
    const ole = sf2.getVariableDeclarationOrThrow('o').getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    OverwriteProperty(ole, 'a', '3');
    OverwriteProperty(ole, 'c', '4');
    expect(ole.getText().replace(/\s/g, '')).toBe('{b:2,a:3,c:4,}');
  });

  it('array helpers', () => {
    const sf = file('const a = [1]; const b = 1;');
    const expr = sf.getVariableDeclarationOrThrow('a').getInitializerOrThrow();
    expect(IsArrayLiteralExpression(expr as any)).toBe(true);
    expect(IsArrayLiteralExpression(undefined)).toBe(false);
    expect(() => AssertArrayLiteralExpression(sf.getVariableDeclarationOrThrow('b').getInitializer() as any, 'b')).toThrow('not an array');
    expect(GetArrayDeclaration(sf, 'a').getName()).toBe('a');
    expect(GetArrayDeclaration(sf, 'fresh', 'string[]').getTypeNode()?.getText()).toBe('string[]');
    expect(() => GetArrayDeclaration(sf, 'b')).toThrow();
  });

  it('decorator argument and array-literal property helpers', () => {
    const sf = file(`@Dec(1, 2) class A {} const o = { arr: [1], str: 'x', noInit };`);
    const cls = sf.getClassOrThrow('A');
    expect(GetClassDecoratorArguments(cls, 'Dec')).toHaveLength(2);
    expect(GetClassDecoratorArguments(cls, d => d.getName() === 'Dec')).toHaveLength(2);
    expect(GetClassDecoratorArguments(cls, 'Other')).toEqual([]);
    const ole = sf.getVariableDeclarationOrThrow('o').getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    expect(GetCoerceArrayLiteralFromObjectLiteral(ole, 'arr').getElements()).toHaveLength(1);
    expect(GetCoerceArrayLiteralFromObjectLiteral(ole, 'new').getElements()).toHaveLength(0);
    expect(() => GetCoerceArrayLiteralFromObjectLiteral(ole, 'str')).toThrow('not an array');
    expect(() => GetCoerceArrayLiteralFromObjectLiteral(ole, 'noInit')).toThrow('Property Assignment');
  });
});
