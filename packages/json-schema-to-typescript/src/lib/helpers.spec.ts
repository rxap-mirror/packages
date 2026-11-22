import { Project } from 'ts-morph';
import { CoerceImports } from './coerce-imports';
import { getFromObject } from './get-from-object';
import { hasIndexSignature } from './has-index-signature';
import { joinPath } from './join';
import { camelize, capitalize, classify, dasherize, decamelize, levenshtein, underscore } from './strings';

describe('strings', () => {
  it('decamelize', () => {
    expect(decamelize('innerHTML')).toBe('inner_html');
    expect(decamelize('action_name')).toBe('action_name');
    expect(decamelize('my favorite items')).toBe('my favorite items');
  });

  it('dasherize', () => {
    expect(dasherize('innerHTML')).toBe('inner-html');
    expect(dasherize('action_name')).toBe('action-name');
    expect(dasherize('css-class-name')).toBe('css-class-name');
    expect(dasherize('my favorite items')).toBe('my-favorite-items');
  });

  it('camelize', () => {
    expect(camelize('innerHTML')).toBe('innerHTML');
    expect(camelize('action_name')).toBe('actionName');
    expect(camelize('css-class-name')).toBe('cssClassName');
    expect(camelize('my favorite items')).toBe('myFavoriteItems');
    expect(camelize('My Favorite Items')).toBe('myFavoriteItems');
    expect(camelize('trailing-')).toBe('trailing');
  });

  it('classify', () => {
    expect(classify('innerHTML')).toBe('InnerHTML');
    expect(classify('action_name')).toBe('ActionName');
    expect(classify('css-class-name')).toBe('CssClassName');
    expect(classify('my favorite items')).toBe('MyFavoriteItems');
    expect(classify('some.dotted-name')).toBe('Some.DottedName');
  });

  it('underscore', () => {
    expect(underscore('innerHTML')).toBe('inner_html');
    expect(underscore('action_name')).toBe('action_name');
    expect(underscore('css-class-name')).toBe('css_class_name');
    expect(underscore('my favorite items')).toBe('my_favorite_items');
  });

  it('capitalize', () => {
    expect(capitalize('innerHTML')).toBe('InnerHTML');
    expect(capitalize('action_name')).toBe('Action_name');
    expect(capitalize('')).toBe('');
  });

  it('levenshtein', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
    expect(levenshtein('ab', 'ba')).toBe(2);
  });
});

describe('joinPath', () => {
  it('joins fragments with single slashes', () => {
    expect(joinPath('a', 'b')).toBe('a/b');
    expect(joinPath('/a/', '/b/')).toBe('a/b');
    expect(joinPath('a//', '//b/c//')).toBe('a/b/c');
  });

  it('skips empty and slash only fragments', () => {
    expect(joinPath(undefined, null, '', '/', 'a')).toBe('a');
    expect(joinPath()).toBe('');
  });
});

describe('hasIndexSignature', () => {
  it('is true for non null objects only', () => {
    expect(hasIndexSignature({})).toBe(true);
    expect(hasIndexSignature([])).toBe(true);
    expect(hasIndexSignature(null)).toBe(false);
    expect(hasIndexSignature('a')).toBe(false);
    expect(hasIndexSignature(undefined)).toBe(false);
  });
});

describe('getFromObject', () => {
  const obj = { a: { b: { c: 1, d: 0, e: null } }, list: [10] };

  it('reads nested paths', () => {
    expect(getFromObject(obj, 'a.b.c')).toBe(1);
    expect(getFromObject(obj, 'a.b.d')).toBe(0);
    expect(getFromObject(obj, 'list.0')).toBe(10);
    expect(getFromObject(obj, 'a.b')).toEqual(obj.a.b);
  });

  it('returns the object for an empty path', () => {
    expect(getFromObject(obj, '')).toBe(obj);
    expect(getFromObject(null, '')).toBeNull();
  });

  it('returns the default for missing paths', () => {
    expect(getFromObject(obj, 'a.x.y', 'dflt')).toBe('dflt');
    expect(getFromObject(obj, 'a.b.c.d', 'dflt')).toBe('dflt');
    expect(getFromObject(null, 'a', 'dflt')).toBe('dflt');
    expect(getFromObject(obj, 'a.b.e.f')).toBeUndefined();
  });
});

describe('CoerceImports', () => {
  const create = (text = '') => new Project({ useInMemoryFileSystem: true }).createSourceFile('a.ts', text);

  it('adds named imports and merges into an existing declaration', () => {
    const file = create(`import { A } from 'mod';\n`);
    CoerceImports(file, { moduleSpecifier: 'mod', namedImports: ['A', 'B'] });
    expect(file.getImportDeclarations()).toHaveLength(1);
    expect(file.getImportDeclarations()[0].getNamedImports().map((n) => n.getName())).toEqual(['A', 'B']);
  });

  it('creates a declaration if none exists', () => {
    const file = create();
    CoerceImports(file, [{ moduleSpecifier: 'mod', namedImports: ['A'] }, { moduleSpecifier: 'other', namedImports: [{ name: 'X' }] }]);
    expect(file.getImportDeclarations().map((d) => d.getModuleSpecifierValue())).toEqual(['mod', 'other']);
  });

  it('keeps type only imports separate', () => {
    const file = create(`import { A } from 'mod';\n`);
    CoerceImports(file, { moduleSpecifier: 'mod', namedImports: ['T'], isTypeOnly: true });
    const declarations = file.getImportDeclarations();
    expect(declarations).toHaveLength(2);
    const typeImport = declarations[1].getNamedImports()[0];
    expect(typeImport.getName()).toBe('T');
    expect(typeImport.isTypeOnly()).toBe(true);
  });

  it('extends an existing type only declaration', () => {
    const file = create(`import type { A } from 'mod';\n`);
    CoerceImports(file, { moduleSpecifier: 'mod', namedImports: ['B'], isTypeOnly: true });
    expect(file.getImportDeclarations()).toHaveLength(1);
    expect(file.getImportDeclarations()[0].getNamedImports().map((n) => n.getName())).toEqual(['A', 'B']);
  });

  it('accepts writer functions only without an existing declaration', () => {
    const file = create();
    CoerceImports(file, { moduleSpecifier: 'mod', namedImports: (w) => w.write('X') });
    expect(file.getFullText()).toContain('X');
    expect(() => CoerceImports(file, { moduleSpecifier: 'mod', namedImports: (w) => w.write('Y') })).toThrow(
      'Invalid named imports',
    );
  });

  it('coerces namespace imports', () => {
    const file = create();
    CoerceImports(file, { moduleSpecifier: 'mod', namespaceImport: 'ns' });
    CoerceImports(file, { moduleSpecifier: 'mod', namespaceImport: 'other' });
    const [declaration] = file.getImportDeclarations();
    expect(file.getImportDeclarations()).toHaveLength(1);
    expect(declaration.getNamespaceImport()!.getText()).toBe('other');
  });

  it('coerces default imports', () => {
    const file = create(`import { A } from 'mod';\n`);
    CoerceImports(file, { moduleSpecifier: 'mod', defaultImport: 'Def' });
    expect(file.getImportDeclarations()[0].getDefaultImport()!.getText()).toBe('Def');
    CoerceImports(file, { moduleSpecifier: 'mod', defaultImport: 'Other' });
    expect(file.getImportDeclarations()[0].getDefaultImport()!.getText()).toBe('Other');
    CoerceImports(file, { moduleSpecifier: 'new', defaultImport: 'N' });
    expect(file.getImportDeclarations()).toHaveLength(2);
  });
});
