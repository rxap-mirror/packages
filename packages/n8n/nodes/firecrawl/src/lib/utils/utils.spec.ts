import { extractParametersFromText, makeToolInputSchema } from './utils';

describe('firecrawl utils', () => {
  describe('extractParametersFromText', () => {
    it('returns nothing for non string input or text without placeholders', () => {
      expect(extractParametersFromText([], 5 as any, 'path')).toEqual([]);
      expect(extractParametersFromText([], 'https://example.com', 'path')).toEqual([]);
    });

    it('extracts required model parameters for each placeholder', () => {
      expect(extractParametersFromText([], 'https://x.com/{a}/{b-c}', 'path')).toEqual([
        { name: 'a', required: true, sendIn: 'path' },
        { name: 'b-c', required: true, sendIn: 'path' },
      ]);
    });

    it('applies type and description from the placeholder definitions', () => {
      const result = extractParametersFromText(
        [{ name: 'a', type: 'number', description: 'the a' }], '{a}', 'qs');
      expect(result).toEqual([{ name: 'a', required: true, sendIn: 'qs', type: 'number', description: 'the a' }]);
    });

    it('sets the key when provided', () => {
      expect(extractParametersFromText([], '{a}', 'body', 'k')).toEqual([
        { name: 'a', required: true, sendIn: 'body', key: 'k' },
      ]);
    });
  });

  describe('makeToolInputSchema', () => {
    it('maps parameter types to zod types', () => {
      const schema = makeToolInputSchema([
        { name: 's', type: 'string', required: true, sendIn: 'path', description: 'desc' },
        { name: 'n', type: 'number', required: true, sendIn: 'path' },
        { name: 'b', type: 'boolean', required: true, sendIn: 'path' },
        { name: 'j', type: 'json', required: true, sendIn: 'path' },
        { name: 'u', required: false, sendIn: 'path' },
      ]);
      expect(schema.parse({ s: 'a', n: 1, b: true, j: { x: 1 } })).toEqual({ s: 'a', n: 1, b: true, j: { x: 1 } });
      expect(() => schema.parse({ s: 'a', n: 'x', b: true, j: {} })).toThrow();
      expect(() => schema.parse({ n: 1, b: true, j: {} })).toThrow();
      expect(schema.shape['s'].description).toBe('desc');
      expect(schema.shape['u'].isOptional()).toBe(true);
    });
  });
});
