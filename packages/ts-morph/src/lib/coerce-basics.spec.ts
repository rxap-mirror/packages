import { SourceFile } from 'ts-morph';
import {
  CoerceGetAccessorDeclaration,
  CoerceSetAccessorDeclaration,
} from './coerce-accessor-declaration';
import { CoerceClass } from './coerce-class';
import { CoerceClassConstructor } from './coerce-class-constructor';
import { CoerceClassMethod } from './coerce-class-method';
import { CoerceClassProperty } from './coerce-class-property';
import { CoerceDefaultClassExport } from './coerce-default-class-export';
import { CoerceFunction } from './coerce-function';
import { CoerceInterface } from './coerce-interface';
import { CoerceMappingClassMethod } from './coerce-mapping-class-method';
import { CoercePropertyAssignment } from './coerce-property-assignment';
import { CoercePropertyDeclaration } from './coerce-property-declaration';
import { CoerceSourceFile } from './coerce-source-file';
import { CoerceStatements } from './coerce-statements';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { CreateProject } from './create-project';
import { FindByNameFunction } from './find-function';
import { GetClass } from './get-class';
import {
  GetArrayLiteralFromObjectLiteral,
  GetCoerceArrayLiteralFromObjectLiteral,
} from './get-coerce-array-literal-form-object-literal';
import { HasConstructorParameter } from './has-constructor-parameter';
import { NormalizeAccordionIdentifier } from './identifier';

describe('ts-morph coerce helpers', () => {
  let sourceFile: SourceFile;

  beforeEach(() => {
    sourceFile = CreateProject().createSourceFile('test.ts', '');
  });

  describe('CreateProject / CoerceSourceFile', () => {
    it('creates an in memory project with default formatting', () => {
      const project = CreateProject();
      const file = project.createSourceFile('a.ts', 'class A {\n m() {} }');
      file.formatText();
      expect(file.getFullText()).toContain('  m() { }');
      expect(CreateProject({ manipulationSettings: { useTrailingCommas: false } }).manipulationSettings.getUseTrailingCommas()).toBe(false);
    });

    it('returns an existing source file or creates a new one', () => {
      const project = CreateProject();
      const first = CoerceSourceFile(project, 'a.ts', 'const a = 1;');
      const second = CoerceSourceFile(project, 'a.ts', 'const b = 2;');
      expect(second).toBe(first);
      expect(first.getFullText()).toBe('const a = 1;');
      expect(CoerceSourceFile(project, 'b.ts').getFullText()).toBe('');
    });
  });

  describe('classes', () => {
    it('CoerceClass creates the class once', () => {
      const first = CoerceClass(sourceFile, 'A', { isExported: true });
      const second = CoerceClass(sourceFile, 'A', { isExported: false });
      expect(second).toBe(first);
      expect(sourceFile.getFullText()).toContain('export class A');
      expect(sourceFile.getClasses()).toHaveLength(1);
    });

    it('CoerceClassMethod adds a method only once', () => {
      const cls = CoerceClass(sourceFile, 'A');
      const method = CoerceClassMethod(cls, 'run', { returnType: 'void', statements: ['doIt();'] });
      expect(method.getReturnTypeNode()!.getText()).toBe('void');
      CoerceClassMethod(cls, 'run', { returnType: 'string' });
      expect(cls.getMethods()).toHaveLength(1);
      expect(cls.getMethodOrThrow('run').getReturnTypeNode()!.getText()).toBe('void');
    });

    it('CoerceClassProperty inserts the property at the top', () => {
      const cls = CoerceClass(sourceFile, 'A');
      cls.addMethod({ name: 'm' });
      CoerceClassProperty(cls, 'p', { type: 'string' });
      expect(cls.getMembers()[0].getText()).toBe('p: string;');
      expect(CoerceClassProperty(cls, 'p', { type: 'number' }).getType().getText()).toBe('string');
    });

    it('CoerceClassConstructor adds an empty constructor if missing', () => {
      const cls = CoerceClass(sourceFile, 'A');
      expect(CoerceClassConstructor(cls)).toHaveLength(1);
      expect(CoerceClassConstructor(cls)).toHaveLength(1);
      expect(cls.getConstructors()).toHaveLength(1);
    });

    it('accessors are only created once', () => {
      const cls = CoerceClass(sourceFile, 'A');
      CoerceGetAccessorDeclaration(cls, 'value', { returnType: 'string', statements: ['return "";'] });
      CoerceGetAccessorDeclaration(cls, 'value', { returnType: 'number' });
      CoerceSetAccessorDeclaration(cls, 'value', { parameters: [{ name: 'v', type: 'string' }] });
      CoerceSetAccessorDeclaration(cls, 'value', {});
      expect(cls.getGetAccessors()).toHaveLength(1);
      expect(cls.getSetAccessors()).toHaveLength(1);
      expect(cls.getGetAccessorOrThrow('value').getReturnTypeNode()!.getText()).toBe('string');
    });

    it('CoercePropertyDeclaration works for classes and interfaces', () => {
      const cls = CoerceClass(sourceFile, 'A');
      const prop = CoercePropertyDeclaration(cls, 'p', { type: 'string', isReadonly: true });
      expect(prop.isReadonly()).toBe(true);
      expect(CoercePropertyDeclaration(cls, 'p', { type: 'number' })).toBe(prop);
      const iface = CoerceInterface(sourceFile, 'I');
      CoercePropertyDeclaration(iface, 'x', { type: 'number' } as any);
      expect(iface.getPropertyOrThrow('x').getTypeNode()!.getText()).toBe('number');
    });
  });

  describe('GetClass', () => {
    it('finds the only class', () => {
      CoerceClass(sourceFile, 'A');
      expect(GetClass(sourceFile).getName()).toBe('A');
    });

    it('finds a class by name or function', () => {
      CoerceClass(sourceFile, 'A');
      CoerceClass(sourceFile, 'B');
      expect(GetClass(sourceFile, 'B').getName()).toBe('B');
      expect(GetClass(sourceFile, (c) => c.getName() === 'A').getName()).toBe('A');
      expect(() => GetClass(sourceFile, 'C')).toThrow();
    });

    it('throws for no or multiple classes', () => {
      expect(() => GetClass(sourceFile)).toThrow('No class declaration found');
      CoerceClass(sourceFile, 'A');
      CoerceClass(sourceFile, 'B');
      expect(() => GetClass(sourceFile)).toThrow('Multiple class declarations');
    });
  });

  it('FindByNameFunction compares trimmed names', () => {
    const find = FindByNameFunction({ name: 'a' });
    expect(find({ getName: () => ' a ' })).toBe(true);
    expect(find({ getName: () => undefined })).toBe(false);
  });

  describe('HasConstructorParameter', () => {
    it('checks parameters and class members', () => {
      const cls = CoerceClass(sourceFile, 'A');
      cls.addConstructor({ parameters: [{ name: 'a' }, { name: 'b', scope: 'private' as any }] });
      expect(HasConstructorParameter(cls, 'a')).toBe(true);
      expect(HasConstructorParameter(cls, 'a', true)).toBe(false);
      expect(HasConstructorParameter(cls, 'b', true)).toBe(true);
      expect(HasConstructorParameter(cls, 'c')).toBe(false);
    });
  });

  describe('CoerceFunction / CoerceInterface / CoerceStatements', () => {
    it('CoerceFunction creates and updates a function', () => {
      const fn = CoerceFunction(sourceFile, 'f', { returnType: 'number', isExported: true });
      const again = CoerceFunction(sourceFile, 'f', { returnType: 'string' });
      expect(again).toBe(fn);
      expect(sourceFile.getFunctions()).toHaveLength(1);
      expect(fn.getReturnTypeNode()!.getText()).toBe('string');
    });

    it('CoerceInterface creates the interface once', () => {
      const first = CoerceInterface(sourceFile, 'I', { isExported: true });
      expect(CoerceInterface(sourceFile, 'I')).toBe(first);
      expect(sourceFile.getFullText()).toContain('export interface I');
    });

    it('CoerceStatements only adds when empty unless overwrite is set', () => {
      const fn = CoerceFunction(sourceFile, 'f');
      CoerceStatements(fn, ['a();']);
      CoerceStatements(fn, ['b();']);
      expect(fn.getBodyText()).toBe('a();');
      CoerceStatements(fn, ['c();', 'd();'], true);
      expect(fn.getBodyText()).toBe('c();\nd();');
      CoerceStatements(fn, 'e();', true);
      expect(fn.getBodyText()).toBe('e();');
    });
  });

  describe('CoerceVariableDeclaration', () => {
    it('creates an exported const by default', () => {
      const d = CoerceVariableDeclaration(sourceFile, 'x', { initializer: '1' });
      expect(d.getInitializer()!.getText()).toBe('1');
      expect(sourceFile.getFullText()).toContain('export const x = 1;');
      expect(CoerceVariableDeclaration(sourceFile, 'x', { initializer: '2' })).toBeDefined();
      expect(sourceFile.getVariableStatements()).toHaveLength(1);
    });

    it('applies custom statement structures', () => {
      CoerceVariableDeclaration(sourceFile, 'y', { initializer: '1' }, { isExported: false });
      expect(sourceFile.getFullText()).toContain('const y = 1;');
      expect(sourceFile.getFullText()).not.toContain('export');
    });
  });

  describe('object and array literal helpers', () => {
    const literal = (text: string) =>
      CreateProject().createSourceFile('l.ts', `const o = ${text};`).getVariableDeclarationOrThrow('o').getInitializerOrThrow() as any;

    it('CoercePropertyAssignment adds missing properties', () => {
      const obj = literal('{}');
      const p = CoercePropertyAssignment(obj, 'a', '1');
      expect(p.getInitializer()!.getText()).toBe('1');
      expect(CoercePropertyAssignment(obj, 'a', '2')).toBeDefined();
      expect(obj.getProperties()).toHaveLength(1);
    });

    it('CoercePropertyAssignment rejects non assignment properties', () => {
      const obj = literal('{ a }');
      expect(() => CoercePropertyAssignment(obj, 'a', '1')).toThrow('not a PropertyAssignment');
    });

    it('GetArrayLiteralFromObjectLiteral', () => {
      expect(GetArrayLiteralFromObjectLiteral(literal('{}'), 'a')).toBeNull();
      expect(GetArrayLiteralFromObjectLiteral(literal('{ a: [1] }'), 'a')!.getElements()).toHaveLength(1);
      expect(() => GetArrayLiteralFromObjectLiteral(literal('{ a }'), 'a')).toThrow('Property Assignment');
      expect(() => GetArrayLiteralFromObjectLiteral(literal('{ a: 1 }'), 'a')).toThrow('not an array');
    });

    it('GetCoerceArrayLiteralFromObjectLiteral creates missing arrays', () => {
      const obj = literal('{}');
      const array = GetCoerceArrayLiteralFromObjectLiteral(obj, 'items');
      array.addElement('1');
      expect(GetCoerceArrayLiteralFromObjectLiteral(obj, 'items').getElements()).toHaveLength(1);
      expect(() => GetCoerceArrayLiteralFromObjectLiteral(literal('{ a: 1 }'), 'a')).toThrow('not an array');
      expect(() => GetCoerceArrayLiteralFromObjectLiteral(literal('{ a }'), 'a')).toThrow('Property Assignment');
    });
  });

  describe('CoerceMappingClassMethod', () => {
    it('returns the input for a simple mapping', () => {
      const cls = CoerceClass(sourceFile, 'A');
      CoerceMappingClassMethod(sourceFile, cls, { name: 'map', parameterType: 'In', returnType: 'Out', mapping: true });
      const m = cls.getMethodOrThrow('map');
      expect(m.getBodyText()).toBe('return input;');
      expect(m.getParameters()[0].getName()).toBe('input');
    });

    it('writes a mapping object', () => {
      const cls = CoerceClass(sourceFile, 'A');
      CoerceMappingClassMethod(sourceFile, cls, {
        name: 'map', parameterType: 'In', returnType: 'Out', mapping: { a: 'a' },
        mappingOptions: { baseProperty: 'src' },
      });
      const m = cls.getMethodOrThrow('map');
      expect(m.getParameters()[0].getName()).toBe('src');
      expect(m.getBodyText()).toMatch(/^return \{[\s\S]*a:[\s\S]*src\.a[\s\S]*\};$/);
    });
  });

  describe('CoerceDefaultClassExport', () => {
    it('exports the class of a file or a class declaration', () => {
      const cls = CoerceClass(sourceFile, 'A');
      CoerceDefaultClassExport(sourceFile);
      expect(sourceFile.getFullText()).toContain('export default A');
      const other = CreateProject().createSourceFile('o.ts', 'class B {}');
      CoerceDefaultClassExport(other.getClassOrThrow('B'));
      expect(other.getFullText()).toContain('export default B');
      expect(cls).toBeDefined();
    });

    it('logs when there is no class', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
      CoerceDefaultClassExport(sourceFile);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('NormalizeAccordionIdentifier', () => {
    it('returns null for empty identifiers', () => {
      expect(NormalizeAccordionIdentifier()).toBeNull();
      expect(NormalizeAccordionIdentifier({} as any)).toBeNull();
      expect(NormalizeAccordionIdentifier({ property: {} } as any)).toBeNull();
    });

    it('normalizes the property and source', () => {
      const result = NormalizeAccordionIdentifier({ property: { name: 'uuid' }, source: 's' })!;
      expect(result.source).toBe('s');
      expect(result.property.name).toBe('uuid');
      expect(result.property.type.name).toBe('string');
      expect(NormalizeAccordionIdentifier({ property: { name: 'x' } })!.source).toBeNull();
    });
  });
});
