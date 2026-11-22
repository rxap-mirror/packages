import { TypescriptInterfaceGenerator } from './typescript-interface-generator';

const gen = (schema: any, options: any = {}) => new TypescriptInterfaceGenerator(schema, options);
const build = (schema: any, name = 'Test', options: any = {}) => gen(schema, options).buildSync(name).getFullText();

describe('TypescriptInterfaceGenerator static helpers', () => {
  it('isRequired', () => {
    expect(TypescriptInterfaceGenerator.isRequired({ required: ['a'] }, 'a')).toBe(true);
    expect(TypescriptInterfaceGenerator.isRequired({ required: ['a'] }, 'b')).toBe(false);
    expect(TypescriptInterfaceGenerator.isRequired({}, 'a')).toBe(false);
  });

  it('coercePropertyKey quotes keys that are no valid identifiers', () => {
    expect(TypescriptInterfaceGenerator.coercePropertyKey('name')).toBe('name');
    for (const key of ['1abc', 'a-b', 'a#b', 'a.b', '@a', 'a/b', 'a:b', 'a*b']) {
      expect(TypescriptInterfaceGenerator.coercePropertyKey(key)).toBe(`'${key}'`);
    }
  });

  it('unionType and intersectionType', () => {
    expect(TypescriptInterfaceGenerator.unionType(['A'])).toBe('A');
    expect(TypescriptInterfaceGenerator.intersectionType(['A'])).toBe('A');
    expect(typeof TypescriptInterfaceGenerator.unionType(['A', 'B'])).toBe('function');
    expect(typeof TypescriptInterfaceGenerator.intersectionType(['A', 'B', 'C'])).toBe('function');
  });
});

describe('TypescriptInterfaceGenerator build', () => {
  it('requires a name', async () => {
    await expect(gen({ type: 'object' }).build('')).rejects.toThrow('name must not be empty');
    expect(() => gen({ type: 'object' }).buildSync('')).toThrow('name must not be empty');
    expect(() => gen({ type: 'object' }).buildSync('X', null as any)).toThrow('bundledSchema must be provided');
  });

  it('build bundles external refs from the same document', async () => {
    const schema = {
      type: 'object',
      definitions: { Id: { type: 'string' } },
      properties: { id: { $ref: '#/definitions/Id' } },
    };
    const file = await gen(schema).build('Thing');
    expect(file.getFullText()).toContain('id?: Id;');
  });

  it('maps primitive types', () => {
    const out = build({
      type: 'object',
      required: ['s'],
      properties: {
        s: { type: 'string' },
        i: { type: 'integer' },
        i2: { type: 'int' },
        n: { type: 'number' },
        b: { type: 'boolean' },
        nl: { type: 'null' },
        a: { type: 'any' },
        u: { type: 'unknown' },
        f: { type: 'file' },
        bin: { type: 'string', format: 'binary' },
      },
    });
    expect(out).toContain('s: string;');
    expect(out).toContain('i?: number;');
    expect(out).toContain('i2?: number;');
    expect(out).toContain('n?: number;');
    expect(out).toContain('b?: boolean;');
    expect(out).toContain('nl?: null;');
    expect(out).toContain('a?: any;');
    expect(out).toContain('u?: unknown;');
    expect(out).toContain('f?: (Blob | File');
    expect(out).toContain('bin?: (Blob | File');
  });

  it('quotes special property keys and adds docs', () => {
    const out = build({
      type: 'object',
      properties: { 'a-b': { type: 'string', description: 'The a-b.' } },
    });
    expect(out).toContain("/** The a-b. */");
    expect(out).toContain("'a-b'?: string;");
  });

  it('creates enums and string tuples', () => {
    const schema = { type: 'object', properties: { kind: { type: 'string', enum: ['one', 'two_x'] } } };
    const asEnum = build(schema, 'Test', { suffix: 'dto' });
    expect(asEnum).toContain('export enum TestKindDtoEnum');
    expect(asEnum).toContain("ONE = 'one'");
    expect(asEnum).toContain("TWO_X = 'two_x'");
    expect(asEnum).toContain('export interface TestDto');
    expect(build(schema, 'Test', { useStringTuple: true })).toContain("kind?: 'one' | 'two_x';");
  });

  it('handles numeric string enums, number enums and mixed enums', () => {
    const out = build({
      type: 'object',
      properties: {
        digits: { type: 'string', enum: ['0', '1'] },
        nums: { type: 'string', enum: [1, 2] },
        mixed: { type: 'string', enum: ['x', 5, 'true'] },
      },
    });
    expect(out).toContain('digits?: 0 | 1;');
    expect(out).toContain('nums?: 1 | 2;');
    expect(out).toContain("mixed?: 'x' | 5 | true;");
  });

  it('writes arrays', () => {
    const out = build({
      type: 'object',
      properties: {
        strings: { type: 'array', items: { type: 'string' } },
        any: { type: 'array' },
        tuple: { type: 'array', items: [{ type: 'string' }] },
        nested: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
      },
    });
    expect(out).toContain('strings?: Array<string>;');
    expect(out).toContain('any?: Array<unknown>;');
    expect(out).toContain('tuple?: Array<unknown>;');
    expect(out).toContain('nested?: Array<Array<number>>;');
  });

  it('writes nested objects, additionalProperties and patternProperties', () => {
    const out = build({
      type: 'object',
      properties: {
        nested: { type: 'object', properties: { a: { type: 'string' } } },
        map: { type: 'object', additionalProperties: { type: 'number' } },
        free: { type: 'object', additionalProperties: true },
        mixed: { type: 'object', properties: { a: { type: 'string' } }, additionalProperties: { type: 'number' } },
        pattern: { type: 'object', patternProperties: { '^a': { type: 'string' }, '^b': { type: 'number' } } },
        patternWithProps: {
          type: 'object',
          properties: { x: { type: 'string' } },
          patternProperties: { '^a': { type: 'string' } },
        },
        open: { type: 'object' },
      },
    });
    expect(out).toMatch(/nested\?: \{\s+a\?: string;\s+\};/);
    expect(out).toContain('map?: Record<string,number>;');
    expect(out).toContain('free?: Record<string,Record<string, unknown>>');
    expect(out).toContain('mixed?:');
    expect(out).toContain('Record<string,string> & Record<string,number>');
    expect(out).toContain('open?: Record<string, unknown>;');
    expect(out).toMatch(/patternWithProps\?:[\s\S]*& Record<string,string>/);
  });

  it('generates a generic alias for objects with additionalProperties', () => {
    const out = build({ type: 'object', properties: { a: { type: 'string' } }, additionalProperties: true });
    expect(out).toContain('export type Test<T = unknown> =');
    expect(out).toContain('& T');
  });

  it('adds a lint-disable comment for empty interfaces', () => {
    const out = build({ type: 'object', properties: {} });
    expect(out).toContain('no-empty-interface');
    expect(out).toContain('export interface Test');
  });

  it('writes oneOf, anyOf, allOf, const and type arrays', () => {
    const out = build({
      type: 'object',
      properties: {
        one: { oneOf: [{ type: 'string' }, { type: 'number' }] },
        any: { anyOf: [{ type: 'string' }, { type: 'boolean' }] },
        all: { allOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { type: 'object', properties: { b: { type: 'string' } } }] },
        cst: { const: 'fixed' },
        multi: { type: ['string', 'null'] },
        multiComplex: { type: ['string', 'array'], items: { type: 'number' } },
        none: {},
      },
    });
    expect(out).toContain('one?: string | number;');
    expect(out).toContain('any?: string | boolean;');
    expect(out).toMatch(/all\?:[\s\S]*&[\s\S]*;/);
    expect(out).toContain("cst?: 'fixed';");
    expect(out).toContain('multi?: string | null;');
    expect(out).toContain('multiComplex?: string | Array<number>;');
    expect(out).toContain('none?: unknown;');
  });

  it('throws for unsupported types', () => {
    expect(() => build({ type: 'object', properties: { a: { type: 'weird' } } })).toThrow("type 'weird' is not supported");
  });

  it('creates type aliases for non object roots', () => {
    expect(build({ type: 'string' }, 'Name')).toContain('export type Name = string;');
    expect(build({ type: 'array', items: { type: 'string' } }, 'Names')).toContain('export type Names = Array<string>;');
    expect(build({}, 'Anything')).toContain('export type Anything<T = unknown> = T;');
  });

  it('uses base path and suffix for file names', () => {
    const file = gen({ type: 'object', properties: {} }, { basePath: 'out/dir/', suffix: 'dto' }).buildSync('MyThing');
    expect(file.getFilePath()).toBe('/out/dir/my-thing.dto.ts');
  });

  it('resolves refs and generates imports for them', () => {
    const schema = {
      components: { schemas: { Child: { type: 'object', properties: { id: { type: 'string' } } } } },
      type: 'object',
      properties: { child: { $ref: '#/components/schemas/Child' } },
    };
    const generator = gen(schema, { addImports: true });
    const file = generator.buildSync('Parent');
    expect(file.getFullText()).toContain("import { type Child } from './child';");
    expect(file.getFullText()).toContain('child?: Child;');
    const without = gen(schema).buildSync('Parent');
    expect(without.getFullText()).not.toContain('import');
  });

  it('supports self referencing schemas without import', () => {
    const schema = {
      components: { schemas: { Node: { type: 'object', properties: { next: { $ref: '#/components/schemas/Node' } } } } },
    };
    const out = build({ $ref: '#/components/schemas/Node' , ...schema }, 'Node', { addImports: true });
    expect(out).toContain('next?: Node;');
    expect(out).not.toContain('import');
  });

  it('reports unresolvable refs', () => {
    expect(() => build({ type: 'object', properties: { a: { $ref: '#/missing/Thing' } } })).toThrow("Could not resolve $ref '#/missing/Thing'");
    expect(() => build({ type: 'object', properties: { a: { $ref: 'nothing' } } })).toThrow(/Could not resolve/);
  });

  it('reuses already generated files', () => {
    const generator = gen({ type: 'object', properties: { a: { type: 'string' } } });
    expect(generator.buildSync('A')).toBe(generator.buildSync('A'));
  });
});
