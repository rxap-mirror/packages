import { NodeOperationError } from 'n8n-workflow';
import { validateEntry } from './set-value';

const node: any = { name: 'n', type: 't', typeVersion: 1, position: [0, 0], parameters: {}, id: '1' };

describe('validateEntry', () => {
  it('maps undefined and null to null', () => {
    expect(validateEntry('a', 'string', undefined, node, 0)).toEqual({ name: 'a', value: null });
    expect(validateEntry('a', 'number', null, node, 0)).toEqual({ name: 'a', value: null });
  });

  it('converts to string', () => {
    expect(validateEntry('a', 'string', 5, node, 0)).toEqual({ name: 'a', value: '5' });
    expect(validateEntry('a', 'string', { x: 1 }, node, 0)).toEqual({ name: 'a', value: '{"x":1}' });
  });

  it('validates and converts numbers and booleans', () => {
    expect(validateEntry('a', 'number', '5', node, 0)).toEqual({ name: 'a', value: 5 });
    expect(validateEntry('a', 'boolean', 'true', node, 0)).toEqual({ name: 'a', value: true });
  });

  it('throws on invalid values by default', () => {
    expect(() => validateEntry('a', 'number', 'abc', node, 3)).toThrow(NodeOperationError);
    expect(() => validateEntry('a', 'number', 'abc', node, 3)).toThrow(/\[item 3\]/);
  });

  it('returns the raw value when ignoring errors', () => {
    expect(validateEntry('a', 'number', 'abc', node, 0, true)).toEqual({ name: 'a', value: 'abc' });
  });
});
