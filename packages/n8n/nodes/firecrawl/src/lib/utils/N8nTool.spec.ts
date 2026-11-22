import { DynamicTool } from '@langchain/core/tools';
import { z } from 'zod';
import { N8nTool, prepareFallbackToolDescription } from './N8nTool';

describe('N8nTool', () => {
  describe('prepareFallbackToolDescription', () => {
    it('returns the description when the schema has no parameters', () => {
      expect(prepareFallbackToolDescription('desc', z.object({}))).toBe('desc');
    });

    it('lists parameters with type and required status', () => {
      const schema = z.object({
        a: z.string().describe('the a'),
        n: z.number().optional(),
        b: z.boolean().nullable(),
        o: z.object({}),
      });
      const text = prepareFallbackToolDescription('desc', schema);
      expect(text).toContain('4 properties');
      expect(text).toContain('a: (description: the a, type: string, required: true)');
      expect(text).toContain('n: (description: , type: number, required: false)');
      expect(text).toContain('b: (description: , type: boolean, required: true)');
      expect(text).toContain('o: (description: , type: object, required: true)');
    });
  });

  describe('asDynamicTool', () => {
    const context: any = {
      getNode: jest.fn(() => ({ name: 'node' })),
      addInputData: jest.fn(() => ({ index: 3 })),
      addOutputData: jest.fn(),
    };
    const build = (schema: z.ZodObject<any>, func = jest.fn(async (input: any) => JSON.stringify(input))) => ({
      func,
      tool: new N8nTool(context, { name: 'tool', description: 'desc', schema, func }).asDynamicTool(),
    });

    beforeEach(() => jest.clearAllMocks());

    it('creates a dynamic tool with the extended description', () => {
      const { tool } = build(z.object({ a: z.string() }));
      expect(tool).toBeInstanceOf(DynamicTool);
      expect(tool.name).toBe('tool');
      expect(tool.description).toContain('desc');
      expect(tool.description).toContain('a: (');
    });

    it('parses valid json input', async () => {
      const { tool, func } = build(z.object({ a: z.string(), b: z.number() }));
      await tool.invoke('{"a":"x","b":2}');
      expect(func).toHaveBeenCalledWith({ a: 'x', b: 2 });
    });

    it('accepts relaxed JS object notation', async () => {
      const { tool, func } = build(z.object({ a: z.string(), b: z.number() }));
      await tool.invoke("{a: 'x', b: 2}");
      expect(func).toHaveBeenCalledWith({ a: 'x', b: 2 });
    });

    it('wraps a plain string for single parameter schemas', async () => {
      const { tool, func } = build(z.object({ url: z.string() }));
      await tool.invoke('https://example.com');
      expect(func).toHaveBeenCalledWith({ url: 'https://example.com' });
    });

    it('throws for invalid input with multiple parameters', async () => {
      const { tool } = build(z.object({ a: z.string(), b: z.string() }));
      await expect(tool.invoke('not json')).rejects.toThrow('Input is not a valid JSON');
    });

    it('reports tool errors back to the workflow and returns the message', async () => {
      const func = jest.fn().mockRejectedValue(new Error('boom'));
      const { tool } = build(z.object({ a: z.string() }), func);
      const result = await tool.invoke('{"a":"x"}');
      expect(result).toContain('boom');
      expect(context.addInputData).toHaveBeenCalledWith('ai_tool', [[{ json: { query: '{"a":"x"}' } }]]);
      expect(context.addOutputData).toHaveBeenCalledWith('ai_tool', 3, expect.any(Error));
    });
  });
});
