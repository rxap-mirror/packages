import {
  AssertOpenApiV3,
  getJsonContentSchema,
  getJsonSchema,
  hasJsonContentSchema,
  hasJsonSchema,
  IsOpenApiV3,
  IsReferenceObject,
  NotContainsReferenceObjects,
} from './utilities';

describe('open-api utilities', () => {
  const schema = { type: 'string' } as any;

  it('IsReferenceObject', () => {
    expect(IsReferenceObject({ $ref: '#/a' })).toBe(true);
    expect(IsReferenceObject({})).toBe(false);
    expect(IsReferenceObject()).toBe(false);
  });

  it('NotContainsReferenceObjects', () => {
    expect(NotContainsReferenceObjects([{ a: 1 } as any])).toBe(true);
    expect(NotContainsReferenceObjects([{ $ref: 'x' }])).toBe(false);
    expect(NotContainsReferenceObjects([undefined])).toBe(false);
    expect(NotContainsReferenceObjects(undefined)).toBe(false);
  });

  it('IsOpenApiV3 / AssertOpenApiV3', () => {
    expect(IsOpenApiV3({ openapi: '3.0.1' })).toBeTruthy();
    expect(IsOpenApiV3({ openapi: '2.0' })).toBeFalsy();
    expect(IsOpenApiV3({})).toBe(false);
    expect(() => AssertOpenApiV3({ openapi: '3.1.0' })).not.toThrow();
    expect(() => AssertOpenApiV3({ openapi: '2.0' })).toThrow('Only openapi version 3.x.x is supported');
  });

  it('hasJsonSchema / getJsonSchema', () => {
    expect(hasJsonSchema(undefined)).toBe(false);
    expect(hasJsonSchema({ 'text/plain': {} })).toBe(false);
    expect(hasJsonSchema({ 'application/hal+json': {} })).toBe(true);
    expect(getJsonSchema({ 'text/plain': {} })).toBeNull();
    expect(getJsonSchema({ 'application/json': { schema } })).toBe(schema);
    expect(getJsonSchema({ 'application/hal+json': { schema } })).toBe(schema);
    expect(getJsonSchema({ 'application/json': {} })).toBeNull();
    expect(getJsonSchema({ 'application/json': { schema: { $ref: 'x' } } })).toBeNull();
  });

  it('hasJsonContentSchema / getJsonContentSchema', () => {
    const ok = { content: { 'application/json': { schema } } } as any;
    expect(hasJsonContentSchema(ok)).toBe(true);
    expect(hasJsonContentSchema(undefined)).toBe(false);
    expect(hasJsonContentSchema({ $ref: 'x' })).toBe(false);
    expect(hasJsonContentSchema({ description: '' } as any)).toBe(false);
    expect(getJsonContentSchema(ok)).toBe(schema);
    expect(getJsonContentSchema({ description: '' } as any)).toBeNull();
  });
});
