import { ElementFactory } from './element-factory';
import { serializeValue } from './serialize-value';

describe('serializeValue', () => {
  it('serializes primitives', () => {
    expect(serializeValue(true)).toBe('true');
    expect(serializeValue(null)).toBe('null');
    expect(serializeValue(undefined)).toBe('');
    expect(serializeValue(42)).toBe('42');
    expect(serializeValue('say "hi"')).toBe('say \\"hi\\"');
  });
  it('serializes objects and arrays as json', () => {
    expect(serializeValue({ a: 1 })).toBe('{"a":1}');
    expect(serializeValue([ 1, 2 ])).toBe('[1,2]');
  });
  it('falls back to String for unserializable objects', () => {
    const circular: any = {};
    circular.self = circular;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(serializeValue(circular)).toBe('[object Object]');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    expect(serializeValue(Symbol.for('x'))).toBe('Symbol(x)');
    expect(serializeValue(BigInt(3))).toBe('3');
  });
});

describe('ElementFactory', () => {
  class El {
    static TAG = 'el';
    name?: string;
    calls: string[] = [];
    preParse() { this.calls.push('preParse'); }
    postParse() { this.calls.push('postParse'); }
    preValidate() { this.calls.push('preValidate'); }
    validate() { return this.name !== 'invalid'; }
    postValidate() { this.calls.push('postValidate'); }
  }

  it('applies properties and runs lifecycle hooks in order', () => {
    const el = ElementFactory(El as any, { name: 'x' } as any) as El;
    expect(el.name).toBe('x');
    expect(el.calls).toEqual([ 'preParse', 'postParse', 'preValidate', 'postValidate' ]);
  });
  it('throws when validation fails', () => {
    expect(() => ElementFactory(El as any, { name: 'invalid' } as any)).toThrow(`The element 'el' created with the element factory is not valid!`);
  });
  it('works for elements without hooks', () => {
    class Plain { a?: number; }
    expect((ElementFactory(Plain as any, { a: 1 } as any) as any).a).toBe(1);
  });
});
