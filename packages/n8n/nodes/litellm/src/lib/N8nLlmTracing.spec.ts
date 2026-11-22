import { NodeApiError, NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { N8nLlmTracing } from './N8nLlmTracing';

// avoid downloading tiktoken encodings: one token per whitespace separated word
jest.mock('@langchain/core/utils/tiktoken', () => ({
  encodingForModel: jest.fn(async () => ({ encode: (t: string) => t.split(/\s+/).filter(Boolean) })),
}));

function createCtx() {
  return {
    addInputData: jest.fn(() => ({ index: 7 })),
    addOutputData: jest.fn(),
    getNode: jest.fn(() => ({ name: 'node', type: 't', typeVersion: 1, position: [0, 0], parameters: {}, id: '1' })),
    logAiEvent: jest.fn(),
    logger: { debug: jest.fn() },
  } as any;
}

describe('N8nLlmTracing', () => {
  let ctx: ReturnType<typeof createCtx>;
  let tracing: N8nLlmTracing;

  beforeEach(() => {
    ctx = createCtx();
    tracing = new N8nLlmTracing(ctx);
  });

  it('has sane defaults', () => {
    expect(tracing.name).toBe('N8nLlmTracing');
    expect(tracing.awaitHandlers).toBe(true);
    expect(tracing.connectionType).toBe(NodeConnectionType.AiLanguageModel);
  });

  describe('default token usage parser', () => {
    it('reads OpenAI token usage', () => {
      expect(
        tracing.options.tokensUsageParser({ tokenUsage: { completionTokens: 3, promptTokens: 4 } }),
      ).toEqual({ completionTokens: 3, promptTokens: 4, totalTokens: 7 });
    });

    it('defaults to zero', () => {
      expect(tracing.options.tokensUsageParser(undefined)).toEqual({
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0,
      });
    });

    it('can be overridden', () => {
      const parser = jest.fn();
      expect(new N8nLlmTracing(ctx, { tokensUsageParser: parser }).options.tokensUsageParser).toBe(parser);
    });
  });

  it('estimates tokens', async () => {
    expect(await tracing.estimateTokensFromStringList(['a b', 'c'])).toBe(3);
    expect(await tracing.estimateTokensFromGeneration([[{ text: 'x y z' }], [{ text: 'w' }]] as any)).toBe(4);
  });

  describe('handleLLMStart / handleLLMEnd', () => {
    it('registers the input and stores the run', async () => {
      await tracing.handleLLMStart({ type: 'constructor', kwargs: { model: 'm' } } as any, ['hello world'], 'run1');
      expect(ctx.addInputData).toHaveBeenCalledWith(NodeConnectionType.AiLanguageModel, [
        [{ json: { messages: ['hello world'], estimatedTokens: 2, options: { model: 'm' } } }],
      ]);
      expect(tracing.runsMap['run1']).toEqual({ index: 7, options: { model: 'm' }, messages: ['hello world'] });
      expect(tracing.promptTokensEstimate).toBe(2);
    });

    it('uses the serialized llm as options when it is not a constructor', async () => {
      const llm: any = { type: 'not_implemented', id: ['x'] };
      await tracing.handleLLMStart(llm, ['p'], 'r');
      expect(tracing.runsMap['r'].options).toBe(llm);
    });

    it('writes output with the reported token usage', async () => {
      await tracing.handleLLMStart({ type: 'constructor', kwargs: {} } as any, ['a b'], 'r');
      await tracing.handleLLMEnd(
        {
          generations: [[{ text: 'out', generationInfo: { x: 1 }, extra: 'dropped' } as any]],
          llmOutput: { tokenUsage: { completionTokens: 5, promptTokens: 2 } },
        },
        'r',
      );
      const [type, index, data] = ctx.addOutputData.mock.calls[0];
      expect(type).toBe(NodeConnectionType.AiLanguageModel);
      expect(index).toBe(7);
      expect(data[0][0].json.response.generations).toEqual([[{ text: 'out', generationInfo: { x: 1 } }]]);
      expect(data[0][0].json.tokenUsage).toEqual({ completionTokens: 5, promptTokens: 2, totalTokens: 7 });
      expect(data[0][0].json.tokenUsageEstimate).toBeUndefined();
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-llm-generated-output', expect.any(String));
    });

    it('falls back to an estimate and handles unknown runs and message objects', async () => {
      tracing.runsMap['r'] = { index: 3, options: {}, messages: [{ toJSON: () => ({ m: 1 }) } as any, 'str', { raw: 1 } as any] };
      tracing.promptTokensEstimate = 4;
      await tracing.handleLLMEnd({ generations: [[{ text: 'one two' }]] }, 'r');
      const json = ctx.addOutputData.mock.calls[0][2][0][0].json;
      expect(json.tokenUsage).toBeUndefined();
      expect(json.tokenUsageEstimate).toEqual({ completionTokens: 2, promptTokens: 4, totalTokens: 6 });
      expect(ctx.logAiEvent.mock.calls[0][1]).toContain('"m":1');

      ctx.addOutputData.mockClear();
      tracing.runsMap = { a: { index: 0, options: {}, messages: 'plain' } };
      await tracing.handleLLMEnd({ generations: [] }, 'unknown');
      expect(ctx.addOutputData.mock.calls[0][1]).toBe(1);
    });
  });

  describe('handleLLMError', () => {
    it('wraps plain errors in a NodeOperationError and strips non x- headers', async () => {
      const error: any = new Error('boom');
      error.headers = { 'x-request-id': '1', authorization: 'secret' };
      await tracing.handleLLMError(error, 'r', 'parent');
      expect(error.headers).toEqual({ 'x-request-id': '1' });
      const [, index, err] = ctx.addOutputData.mock.calls[0];
      expect(index).toBe(0);
      expect(err).toBeInstanceOf(NodeOperationError);
      expect(ctx.logAiEvent).toHaveBeenCalledWith('ai-llm-errored', expect.stringContaining('parent'));
    });

    it('passes NodeErrors through the description mapper', async () => {
      const mapper = jest.fn(() => 'mapped');
      const t = new N8nLlmTracing(ctx, { errorDescriptionMapper: mapper });
      const err = new NodeApiError(ctx.getNode(), { message: 'api' } as any);
      t.runsMap['r'] = { index: 4, options: {}, messages: '' };
      await t.handleLLMError(err, 'r');
      expect(err.description).toBe('mapped');
      expect(ctx.addOutputData).toHaveBeenCalledWith(NodeConnectionType.AiLanguageModel, 4, err);
    });

    it('stringifies empty error objects for logging', async () => {
      await tracing.handleLLMError(new Error('empty'), 'r');
      expect(ctx.logAiEvent.mock.calls[0][1]).toContain('Error: empty');
    });
  });
});
