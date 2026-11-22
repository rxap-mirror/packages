import { NormalizeDataProperty, NormalizeDataPropertyList, NormalizeDataPropertyToPropertySignatureStructure } from './data-property';
import { CreateProject } from './create-project';
import {
  IsTypeImport,
  NormalizeTypeImport,
  NormalizeTypeImportList,
  RequiresTypeImport,
  TypeImportToImportStructure,
  TypeNames,
} from './type-import';
import { IsWriteTypeOptions, WriteStringType, WriteType } from './write-type';

describe('type-import', () => {
  it('IsTypeImport / RequiresTypeImport', () => {
    expect(IsTypeImport({ name: 'A' })).toBe(true);
    expect(IsTypeImport({})).toBe(false);
    expect(IsTypeImport('A')).toBe(false);
    expect(RequiresTypeImport({ name: 'A' })).toBe(false);
    expect(RequiresTypeImport({ name: 'A', moduleSpecifier: 'm' })).toBe(true);
  });

  it('TypeImportToImportStructure', () => {
    expect(() => TypeImportToImportStructure({ name: 'A' })).toThrow('moduleSpecifier is required');
    expect(TypeImportToImportStructure({ name: 'A', moduleSpecifier: 'm' })).toEqual({ moduleSpecifier: 'm', namedImports: ['A'] });
    expect(TypeImportToImportStructure({ name: 'A', moduleSpecifier: 'm', namedImport: 'B' })).toEqual({ moduleSpecifier: 'm', namedImports: ['B'] });
    expect(TypeImportToImportStructure({ name: 'A', moduleSpecifier: 'm', namespaceImport: 'ns' })).toEqual({ moduleSpecifier: 'm', namespaceImport: 'ns' });
    expect(TypeImportToImportStructure({ name: 'A', moduleSpecifier: 'm', defaultImport: 'D' })).toEqual({ moduleSpecifier: 'm', defaultImport: 'D' });
  });

  describe('NormalizeTypeImport', () => {
    it('applies defaults', () => {
      expect(NormalizeTypeImport()).toEqual({
        name: 'unknown', moduleSpecifier: null, namedImport: null, namespaceImport: null, isTypeOnly: false, defaultImport: null,
      });
      expect(NormalizeTypeImport(undefined, 'string').name).toBe('string');
      expect(NormalizeTypeImport(undefined, { name: 'X', moduleSpecifier: 'm', namedImport: 'N', namespaceImport: 'ns', isTypeOnly: true, defaultImport: 'D' })).toEqual({
        name: 'X', moduleSpecifier: 'm', namedImport: 'N', namespaceImport: 'ns', isTypeOnly: true, defaultImport: 'D',
      });
    });

    it('parses the name:moduleSpecifier:namedImport string form', () => {
      expect(NormalizeTypeImport('IconConfig:@rxap/utilities')).toMatchObject({ name: 'IconConfig', moduleSpecifier: '@rxap/utilities', namedImport: null });
      expect(NormalizeTypeImport('A:m:B')).toMatchObject({ name: 'A', moduleSpecifier: 'm', namedImport: 'B' });
      expect(NormalizeTypeImport('')).toMatchObject({ name: 'unknown', moduleSpecifier: null });
    });

    it('copies object forms', () => {
      expect(NormalizeTypeImport({ name: 'A', moduleSpecifier: 'm', isTypeOnly: true })).toMatchObject({ name: 'A', moduleSpecifier: 'm', isTypeOnly: true });
    });

    it('normalizes lists', () => {
      expect(NormalizeTypeImportList(['A', { name: 'B' }]).map((t) => t.name)).toEqual(['A', 'B']);
      expect(NormalizeTypeImportList()).toEqual([]);
    });
  });
});

describe('NormalizeDataProperty', () => {
  it('parses the name:type string form', () => {
    const p = NormalizeDataProperty('username:string');
    expect(p.name).toBe('username');
    expect(p.type.name).toBe('string');
    expect(p.isArray).toBe(false);
    expect(p.isOptional).toBe(false);
    expect(p.source).toBeNull();
    expect(Object.isFrozen(p)).toBe(true);
  });

  it('guesses the type from the name', () => {
    expect(NormalizeDataProperty('uuid').type.name).toBe('string');
    expect(NormalizeDataProperty('name').type.name).toBe('string');
    expect(NormalizeDataProperty('userUuid').type.name).toBe('string');
    expect(NormalizeDataProperty('displayName').type.name).toBe('string');
    expect(NormalizeDataProperty('isActive').type.name).toBe('boolean');
    expect(NormalizeDataProperty('hasChildren').type.name).toBe('boolean');
    expect(NormalizeDataProperty('icon').type).toMatchObject({ name: 'IconConfig', moduleSpecifier: '@rxap/utilities' });
    expect(NormalizeDataProperty('other').type.name).toBe('unknown');
    expect(NormalizeDataProperty('other', 'number').type.name).toBe('number');
  });

  it('detects arrays from the name', () => {
    expect(NormalizeDataProperty('tags[]')).toMatchObject({ name: 'tags', isArray: true });
    expect(NormalizeDataProperty('Array<tags>')).toMatchObject({ name: 'tags', isArray: true });
    expect(NormalizeDataProperty('tags', 'unknown', true).isArray).toBe(true);
  });

  it('normalizes names', () => {
    expect(NormalizeDataProperty('1abc').name).toBe('_1abc');
    expect(NormalizeDataProperty('my-property').name).toBe('myProperty');
    expect(NormalizeDataProperty('__my-property').name).toBe('__myProperty');
  });

  it('handles object properties and member lists', () => {
    const p = NormalizeDataProperty({
      name: 'address', isOptional: true, isArray: true, source: 'src',
      memberList: ['street:string', { name: 'zip', type: 'number' }],
    });
    expect(p.isOptional).toBe(true);
    expect(p.isArray).toBe(true);
    expect(p.source).toBe('src');
    expect(p.type.name).toBe(TypeNames.Deferred);
    expect(p.memberList.map((m) => [m.name, m.type.name])).toEqual([['street', 'string'], ['zip', 'number']]);
    expect(NormalizeDataProperty({ name: 'x', type: { name: 'unknown' } }, 'string').type.name).toBe('string');
    expect(NormalizeDataProperty({ name: 'x', type: 'Foo:foo-module' }).type).toMatchObject({ name: 'Foo', moduleSpecifier: 'foo-module' });
  });

  it('normalizes lists', () => {
    expect(NormalizeDataPropertyList(['a:string', 'b']).map((p) => p.name)).toEqual(['a', 'b']);
    expect(NormalizeDataPropertyList()).toEqual([]);
    expect(NormalizeDataPropertyList(['a'], 'number')[0].type.name).toBe('number');
  });

  it('converts to a property signature structure', () => {
    const file = CreateProject().createSourceFile('a.ts', '');
    const structure = NormalizeDataPropertyToPropertySignatureStructure({ name: 'a', type: 'string', isArray: true }, file);
    expect(structure.name).toBe('a');
    file.addInterface({ name: 'I', properties: [structure] });
    expect(file.getFullText()).toContain('a: Array<string>;');
  });
});

describe('WriteType', () => {
  const file = () => CreateProject().createSourceFile('a.ts', '');
  const render = (type: any, f = file()) => {
    const alias = f.addTypeAlias({ name: 'T', type: WriteType(type, f) });
    return alias.getTypeNodeOrThrow().getText();
  };

  it('IsWriteTypeOptions', () => {
    expect(IsWriteTypeOptions({ type: 'a' })).toBeTruthy();
    expect(IsWriteTypeOptions('a')).toBeFalsy();
    expect(IsWriteTypeOptions(null)).toBeFalsy();
  });

  it('WriteStringType maps date and uuid', () => {
    const w: any = { write: jest.fn() };
    WriteStringType('date', w);
    WriteStringType('uuid', w);
    WriteStringType('Foo', w);
    expect(w.write.mock.calls.map((c: any[]) => c[0])).toEqual(['Date', 'string', 'Foo']);
  });

  it('writes strings, arrays and writer functions', () => {
    expect(render('string')).toBe('string');
    expect(render('date')).toBe('Date');
    expect(render({ type: 'uuid', isArray: true })).toBe('Array<string>');
    expect(render((w: any) => w.write('Custom'))).toBe('Custom');
    expect(render({ type: (w: any) => w.write('X'), isArray: true })).toBe('Array<X>');
  });

  it('writes type imports and coerces the import', () => {
    const f = file();
    expect(render({ name: 'Foo', moduleSpecifier: './foo' }, f)).toBe('Foo');
    expect(f.getFullText()).toContain("import { Foo } from './foo';");
    expect(render({ name: 'Bar' }, f)).toBe('Bar');
  });

  it('rejects invalid types', () => {
    const f = file();
    expect(() => f.addTypeAlias({ name: 'T', type: WriteType(5 as any, f) })).toThrow('Invalid type');
  });
});
